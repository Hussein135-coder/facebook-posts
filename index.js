// Requiring module
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const { JSDOM } = require('jsdom');
const puppeteer = require('puppeteer');
const shedule = require('node-schedule');
//const db = require('./db');
const Pages = require('./pages')
// const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
require('dotenv').config()

const bot = new TelegramBot('6341924400:AAHPVb8kGy1Asuwy1Gu45763biySzQiVhkI',{polling: true});

const hussein = '245853116';
const saleh = '312877637'
const deaa = '496497144'

const users = [hussein, saleh, deaa]
async function connectDb (){
        try {
                await mongoose.connect(process.env.URI)
                console.log("connected")
				PagesPosts()
        } catch (error) {
                console.log(error)
        }
}


const app = express();


app.use(
	cors({origin: ['https://syria-res.blogspot.com', 'https://www.syr-edu.com']})
);


// Port Number
const PORT = process.env.PORT || 5000;

// Server Setup
app.listen(PORT, console.log(
	`Server started on port ${PORT}`));

	app.get('/add', async (req, res) => {

		try {
			const name = req.query.id;
			const link = req.query.link;
			const post =  req.query.post;
			const postLink =req.query.postLink;
			let page = await new Pages({name,link,post,postLink}).save();
			console.log(page)
			return res.json(page);
		} catch (error) {
			console.log(error)
			return res.json({message: "error"})
		}
})

app.get('/posts', async (req, res) => {
	try {
		const posts = await Pages.find();
		return res.json(posts);
	} catch (error) {
		console.log(error)
		return res.json({message: "error"})
		}
	}
)


app.get('/update', async (req, res) => {
	try {
		const newPost ={
			"_id": req.query.id,
			"name":req.query.name,
			"link": req.query.link,
			"post": req.query.post,
			"postLink": req.query.postLink,
			"createdAt": "2023-07-02T10:53:09.538Z",
			"updatedAt": "2023-07-02T10:53:09.538Z",
			"__v": 0
		}

		const response = await Pages.findOneAndUpdate({_id: '64a16ea0eaad82d88c8f23b5'} ,  newPost)
		return res.json({message: response});
	} catch (error) {
		console.log(error)
		return res.json({message: "error"})
		}
	}
)

async function scrapeFacebookPost(pageUrl) {
	try {
		let time= 0 ;
		const calcTime = setInterval(() => {
			time++;
		}, 1000);
		const browser = await puppeteer.launch();
		const page = await browser.newPage();

		await page.goto(pageUrl, { timeout: 60000 });

		const postSelector = await page.waitForSelector('div[data-ad-preview="message"], div[dir="auto"]');
		const linkSelector = await page.waitForSelector(`a[href^="${pageUrl}/posts"] , a[href^="https://www.facebook.com/perm"]`);

		const post = await postSelector.evaluate(el => el.textContent);
		const link = await linkSelector.evaluate(el => el.href);

	// 	if(post.includes('عرض المزيد')){
	// 		await page.evaluate(() => {
	// 			document.querySelectorAll('div[role="button"]')[6].click()
	// });
	// postSelector = await page.waitForSelector('div[data-ad-preview="message"]');
		//}
		await browser.close();
		clearInterval(calcTime);
		console.log(time)
		console.log(post)
		console.log(link)
		return {post,link};
	} catch (error) {
		console.log(error)
		return {post:null,link:null}
	}
	
}

//const post = scrapeFacebookPost('https://www.facebook.com/syr.edu1');

async function PagesPosts(){
	try {
		const posts = await Pages.find();
		
		posts.forEach(async (post,i) => {
		console.log("loop",i+1)
		const pagePost = await scrapeFacebookPost(post.link);
		console.log(pagePost.post ,"Page post");
		console.log(post.post ,"DB");
		if(pagePost.post == null || pagePost.post == post.post ){
			console.log("same",i,pagePost.link)
			return;
		}
		const newPost ={
		"_id": post._id,
		"name": post.name,
		"link": post.link,
		"post": pagePost.post,
		"postLink": pagePost.link,
		"createdAt": "2023-07-02T10:53:09.538Z",
		"updatedAt": "2023-07-02T10:53:09.538Z",
		"__v": 0
	}
		console.log(newPost)
		await Pages.findOneAndUpdate({_id: post._id} ,  newPost)
		//Pages.updateOne({_id: post._id} , {$set: newPost})
	const msg = `<b>اسم الصفحة:</b> ${post.name}\n<b>المنشور:</b> ${pagePost.post}\n<b>رابط المنشور:</b> ${pagePost.link}`
		sendMessageTelegram(msg)
		})
	} catch (error) {
		console.log(error)
		}
}
// connectDb()


shedule.scheduleJob("* * * * *", function () {
	connectDb()
})


const sendMessageTelegram = (msg) => {
	users.forEach(user => {
		bot.sendMessage(user, msg , { parse_mode: 'HTML' })
			.then(() => {
				console.log('Message sent successfully');
			})
			.catch((error) => {
				console.error(error);
			});
	});
}
