const express = require("express")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const mongoose = require("mongoose")


const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(morgan("dev"))

app.use(express.static(__dirname + "/public"))
app.set("view engine", "ejs")


// connecting to the DB
mongoose.connect("mongodb://localhost:27017/itemsDB", {
    useNewUrlParser: true, useUnifiedTopology: true
})
    .then(() => {
        console.log(`DB Connected`);
    })
    .catch(err => {
        if (err) console.log(err.message);
    })


// creating new schema
const itemSchema = new mongoose.Schema({
    name: String
})

//creating new collection
const Item = mongoose.model("Item", itemSchema)


// default items in list....
const item1 = new Item({
    name: "Bringfood"
})
const item2 = new Item({
    name: "Prepfood"
})
const item3 = new Item({
    name: "Eatfood"
})

const itemArray = [item1, item2, item3]


app.get("/", (req, res) => {
    const day = new Date()

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }

    const today = day.toLocaleDateString("us-en", options)


    Item.find({}, (err, foundItems) => {

        if (foundItems.length === 0) {
            Item.insertMany(itemArray, (err) => {
                if (err) console.log(err);
                else {
                    console.log(`Default items inserted to DB successfully.`);
                }
            })
            res.redirect("/")
            // continue
        }
        else {
            res.render("list", { today: today, newItems: foundItems })
        }

    })

})


app.post("/", (req, res) => {
    const newItem = req.body.newItem

    if (newItem.trim() !== "") {

        const tempItem = new Item({
            name: newItem
        })

        tempItem.save()

        res.redirect("/")
    }
    else {
        console.log("Enter some text to add to the list.")
        res.redirect("/")
    }

})


app.post("/delete", (req, res) => {
    const itemToBeRemoved = req.body.checkbox

    Item.findByIdAndRemove(itemToBeRemoved, (err) => {
        if (!err) console.log("successfully removed item")

        res.redirect("/")
    })
})



//setting up server
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`servre live at port ${port}`)
})