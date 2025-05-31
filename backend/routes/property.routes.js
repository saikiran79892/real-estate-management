const express = require('express');
const Property = require('../models/property.model');
const User = require('../models/user.model');
const { auth, checkRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Get featured properties
router.get('/featured', async (req, res) => {
    try {
        const properties = await Property.find({ status: 'available' })
            .sort('-createdAt')
            .limit(6)
            .populate('seller', 'name email');
        res.json(properties);
    } catch (error) {
        console.error('Error fetching featured properties:', error);
        res.status(500).json({ message: 'Failed to fetch featured properties' });
    }
});

// Get property statistics
router.get('/stats', async (req, res) => {
    try {
        const [totalProperties, totalSellers, avgPriceResult] = await Promise.all([
            Property.countDocuments({ status: 'available' }),
            User.countDocuments({ role: 'seller' }),
            Property.aggregate([
                { $match: { status: 'available' } },
                { $group: { _id: null, averagePrice: { $avg: '$price' } } }
            ])
        ]);

        res.json({
            totalProperties,
            totalSellers,
            averagePrice: avgPriceResult[0]?.averagePrice || 0
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Failed to fetch property statistics' });
    }
});

// Get seller's properties
router.get('/seller/listings', auth, async (req, res) => {
    try {
        const properties = await Property.find({ seller: req.user._id })
            .sort('-createdAt');
        res.json(properties);
    } catch (error) {
        console.error('Error fetching seller properties:', error);
        res.status(500).json({ message: 'Failed to fetch your properties' });
    }
});

// Get all properties with filters
router.get('/', async (req, res) => {
    try {
        const { type, minPrice, maxPrice, location, limit = 10, sort = '-createdAt' } = req.query;
        const query = { status: 'available' };

        if (type) query.propertyType = type;
        if (location) query.location = new RegExp(location, 'i');
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const properties = await Property.find(query)
            .populate('seller', 'name email')
            .sort(sort)
            .limit(Number(limit));
        res.json(properties);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Failed to fetch properties' });
    }
});

// Get single property
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('seller', 'name email');
        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }
        res.json(property);
    } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Failed to fetch property details' });
    }
});

// Create property (Seller only)
router.post('/', [auth, checkRole(['seller'])], async (req, res) => {
    try {
        const propertyData = {
            ...req.body,
            seller: req.user._id
        };

        // Validate image URLs
        if (!propertyData.imageUrls || propertyData.imageUrls.length === 0) {
            return res.status(400).json({ message: 'At least one image URL is required' });
        }

        const property = new Property(propertyData);
        await property.save();
        
        res.status(201).json(property);
    } catch (error) {
        console.error('Error creating property:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to create property',
            details: error.errors
        });
    }
});

// Update property (Seller only)
router.put('/:id', [auth, checkRole(['seller'])], async (req, res) => {
    try {
        const property = await Property.findOne({
            _id: req.params.id,
            seller: req.user._id
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        // Validate image URLs if they're being updated
        if (req.body.imageUrls && req.body.imageUrls.length === 0) {
            return res.status(400).json({ message: 'At least one image URL is required' });
        }

        Object.assign(property, req.body);
        await property.save();
        res.json(property);
    } catch (error) {
        console.error('Error updating property:', error);
        res.status(500).json({ message: 'Failed to update property' });
    }
});

// Delete property (Seller only)
router.delete('/:id', [auth, checkRole(['seller'])], async (req, res) => {
    try {
        const property = await Property.findOneAndDelete({
            _id: req.params.id,
            seller: req.user._id
        });

        if (!property) {
            return res.status(404).json({ message: 'Property not found' });
        }

        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        console.error('Error deleting property:', error);
        res.status(500).json({ message: 'Failed to delete property' });
    }
});

module.exports = router; 