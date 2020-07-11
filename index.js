const express = require("express")
const bodyParser = require("body-parser")
// const morgan = require("morgan")
const mongoose = require("mongoose")
const _ = require("lodash")


const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
// app.use(morgan("dev"))

app.use(express.static(__dirname + "/public"))
app.set("view engine", "ejs")

let today = ""


// connecting to the DB
mongoose.connect("mongodb://localhost:27017/itemsDB", {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false
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


//custom list schema...
const customListSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
})

const List = mongoose.model("List", customListSchema)

// custom lists....

app.get("/:customList", (req, res) => {

    const customListName = _.capitalize(req.params.customList)

    List.findOne({ name: customListName }, (err, foundItem) => {
        if (!err) {

            if (!foundItem) {
                const list = new List({
                    name: customListName,
                    items: itemArray
                })

                list.save()
                res.redirect(`/${customListName}`)
            }
            else {
                res.render("list", { listTitle: foundItem.name, newItems: foundItem.items })
            }
        }
    })
})



app.get("/", (req, res) => {
    const day = new Date()

    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }

    today = day.toLocaleDateString("us-en", options)


    Item.find({}, (err, foundItems) => {

        if (foundItems.length === 0) {
            Item.insertMany(itemArray, (err) => {
                if (err) console.log(err);
                else {
                    console.log(`Default items inserted to DB successfully.`);
                }
            })
            res.redirect("/")
        }
        else {
            res.render("list", { listTitle: today, newItems: foundItems })
        }

    })

})


app.post("/", (req, res) => {
    const newItem = req.body.newItem
    const listName = req.body.list

    if (newItem.trim() !== "") {

        const tempItem = new Item({
            name: newItem
        })

        if (listName === today) {
            tempItem.save()
            res.redirect("/")
        }
        else {
            List.findOne({ name: listName }, (err, foundList) => {
                foundList.items.push(tempItem)
                foundList.save()
                res.redirect(`/${listName}`)
            })
        }

    }
    else {
        console.log("Enter some text to add to the list.")
        res.redirect("/")
    }

})


app.post("/delete", (req, res) => {
    const itemToBeRemoved = req.body.checkbox
    const listName = req.body.listName


    if (listName === today) {
        Item.findByIdAndRemove(itemToBeRemoved, (err) => {
            if (!err) console.log("successfully removed item")

            res.redirect("/")
        })
    }
    else {
        List.update({ name: listName }, { $pull: { items: { _id: itemToBeRemoved } } }, (err, foundItem) => {
            if (!err)
            res.redirect(`/${listName}`)
        })

        // List.findOne({name : listName}, (err, foundList) => {
        //     if(!err){
        //         foundList.filter
        //     }
        // })
    }

})



//setting up server
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`servre live at port ${port}`)
})