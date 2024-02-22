const express = require('express');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt')
const cors = require('cors');
const dotenv = require('dotenv')
dotenv.config()

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect( process.env.db ,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB successfully');
});

const deliveryAgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, // Ensure uniqueness of email
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email format'
    }
  },
  password: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  dob: { type: Date },
  longitude: { type: Number },
  latitude: { type: Number },
  modeOfDelivery: { type: String },
});

// Hash password before saving
deliveryAgentSchema.pre('save', async function(next) {
  const deliveryAgent = this;
  if (!deliveryAgent.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(deliveryAgent.password, salt);
    deliveryAgent.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});

const DeliveryAgent = mongoose.model('DeliveryAgent', deliveryAgentSchema);

app.post('/api/signup', async (req, res) => {
    try {
      const { name, mobileNumber, email, password, address, pincode, city, dob, modeOfDelivery } = req.body;
      // Check if email already exists
      const existingAgent = await DeliveryAgent.findOne({ email });
      if (existingAgent) {
        return res.status(400).send({ message: 'Email already exists' });
      }
      const deliveryAgent = new DeliveryAgent({ name, mobileNumber, email, password, address, pincode, city, dob, modeOfDelivery });
      await deliveryAgent.save();
      console.log('Delivery agent created successfully:', deliveryAgent);
      res.status(201).send(deliveryAgent);
    } catch (error) {
      console.error('Error creating delivery agent:', error);
      res.status(400).send(error);
    }
  });
  app.get('/', (req, res) => {
    res.send('form working good');
  });
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
