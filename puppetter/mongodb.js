const mongoose = require('mongoose');
const uri = "mongodb+srv://pbshayar:kayar@cluster0.0jztak4.mongodb.net/?retryWrites=true&w=majority";
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };
async function init() {
    try {
        await mongoose.connect(uri, clientOptions);
        await mongoose.connection.db.admin().command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.log(err);
    }
}

const submitPrice = async (req, res) => {
    console.log(req.body)
    try {
        await insertPrice(req.body.Url, req.body.shownPrice, parseInt(req.body.deliveryPrice) + parseInt(req.body.missPrice), req.body.selectedState);
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500);
    }
}

const priceSchema = new mongoose.Schema({
    productName: String,
    shownPrice: Number,
    additionalCost: Number,
    state: String
});

const Price = mongoose.model('Price', priceSchema);

async function insertPrice(productName, shownPrice, additionalCost, state) {
    try {
        const newPrice = new Price({
            productName: productName,
            shownPrice,
            additionalCost,
            state
        });
        await newPrice.save();
        console.log("Price inserted successfully.");
    } catch (err) {
        console.log("Error inserting price:", err);
    }
}
async function getPrices(req, res) {
    try {
        let data = await mongoose.model('Price').find({ productName: req.body.url });
        if (data.length == 0) {
            res.status(200).json({ error: "Not enough data", success: false }); return;
        }
        let shownPrice = data.map(elem => { return elem.shownPrice });
        let additionalCost = data.map(elem => { return elem.additionalCost });
        data = [{
            label: 'shown Price',
            data: [Math.min(...shownPrice),
            shownPrice.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / shownPrice.length,
            Math.max(...shownPrice)]
        },
        {
            label: 'additional Cost',
            data:
                [Math.min(...additionalCost),
                additionalCost.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / shownPrice.length,
                Math.max(...additionalCost)]
        }]
        res.status(200).json({ success: true, data: data })
    } catch (err) {
        console.log(err);
    }
}

async function getCountOfDocuments() {
    try {
        const count = await mongoose.model('Price').countDocuments();
        console.log("Count of documents in 'prices' collection:", count);
    } catch (err) {
        console.error("Error:", err);
    }
}

module.exports = {
    init, submitPrice, getPrices
}