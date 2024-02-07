const express = require("express")
const app = express();
const puppet = require("puppeteer");
const cors = require('cors');
const mongodb = require('./mongodb')
mongodb.init()

app.use(express.json());
app.use(cors());
async function query(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/ThanosAng/Product_Review_Summary",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}
async function query2(data) {
	const response = await fetch(
		"https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment",
		{
			headers: { Authorization: "Bearer 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" },
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}
async function query3(data) {
	const response = await fetch('https://api.api-ninjas.com/v1/textsimilarity', {
		method: 'POST',
		headers: { 'X-Api-Key': 'HiXqAe0KyEcYhKepejR4sQ==ZDmUzPex7cnBKk8E' },
		body: JSON.stringify(data)
	})
	const result = await response.json();
	return result;
}

const checkSpam = async (arr) => {
	let promises = []
	for (let i = 0; i < 5; i++) {
		for (let j = i + 1; j < Math.min(arr.length, i + 100); j++) {
			promises.push(query3({ "text_1": arr[i], "text_2": arr[j] }))
		}
	}
	let result = await Promise.all(promises)
	result = result.map((elem) => { return elem.similarity });
	console.log(result);
	return Math.max(...result)
}

const loadAmazon = async (url) => {
	try {
		let browser = await puppet.launch({ headless: true });
		let page = await browser.newPage();
		let clickFirst = "a.a-link-emphasis:nth-child(2)"
		await page.goto(url);
		await page.waitForSelector(clickFirst);
		page.click(clickFirst);
		page.setDefaultNavigationTimeout(60000);
		await page.waitForNavigation()
		let comment = "#cm_cr-review_list"
		await page.waitForSelector(comment);
		let pageContent = await page.evaluate((sel) => {
			return document.querySelector(sel).innerText;
		}, comment);

		await browser.close();
		// let ask = "please summarise the following paragraph in double quotes. Try to be brief and only focus on reviews by the users, but please ensure user reviews are present in your output." + '\n';
		const regex = /stars([\s\S]*?)Helpful/g;
		const matches = Array.from(pageContent.matchAll(regex), match => match[1].trim());
		pageContent = matches.map((match, index) => `Review ${index + 1}:\n${match}`).join('\n\n');
		let ask = "\"" + pageContent + "\"";
		if (ask.length >= 1024) {
			ask = ask.slice(0, 1024);
		}
		const data = await query({ "inputs": ask });
		// let summary="Is the below paragraph giving positive,negative or mixed vibes"+'\n';
		let summary = "\"" + data[0].generated_text + "\"";
		const dusra_data = await query2({ "inputs": summary });
		let botsFound = null;
		if (matches.length <= 3) {
			botsFound = 'Enough Reviews not found to check for spam!';
		} else {
			let similarity = await checkSpam(matches);
			if (similarity > 0.9) {
				botsFound = 'Some Reviews are very similar, they might be spammed by bots!';
			} else botsFound = 'No spam detected.';
		}
		return { summary: data[0].generated_text, bias: dusra_data[0], botsFound };
	} catch (err) {
		console.log(err);
		throw "error";
	}
};

const loadLocal = async (url) => {
	const newUrl = new URL(url);
	const lastSegment = newUrl.pathname.split('/').pop();
	let browser = await puppet.launch({ headless: true });
	let page = await browser.newPage();
	await page.goto(url, { waitUntil: 'domcontentloaded' });
	let clickFirst = `#\\3${lastSegment}`;
	await page.waitForSelector(clickFirst);
	page.click(clickFirst);
	page.setDefaultNavigationTimeout(60000);
	await page.waitForNavigation({ waitUntil: 'domcontentloaded' })
	await page.waitForSelector("#root > div > div > div > div.card-footer > div > div > div:nth-child(1) > div > p");
	let comment = "#root > div > div > div > div.card-footer > div > div"
	let pageContent = await page.evaluate((sel) => {
		return document.querySelector(sel).innerText;
	}, comment);
	await browser.close();
	// let ask = "please summarise the following paragraph in double quotes. Try to be brief and only focus on reviews by the users, but please ensure user reviews are present in your output." + '\n';
	let ask = "\"" + pageContent + "\"";
	const data = await query({ "inputs": ask, "wait_for_model": "true" });
	// let summary="Given some number of reviews, please respond whether these set of comments seem to be biased towards the product (or spam). Respond in one word biased or unbiased?"+'\n';
	const dusra_data = await query2({ "inputs": ask });
	return { summary: data[0], bias: dusra_data[0] };
};


app.post("/submitPrice", mongodb.submitPrice)
app.post("/getPrices", mongodb.getPrices)
app.post("/getReview", async (req, res) => {
	const url = req.body.url;
	const web = req.body.web;
	console.log(url);
	try {
		let getReview = 0;
		if (!web) {
			getReview = await loadAmazon(url);
		}
		else {
			getReview = await loadLocal(url);
		}
		// let getReview={
		// 	summary_text: 'Aveekay rated out of five stars Good one, Reviewed on 2 March 2023 colour: b15 Verified Purchase Good product, worth the price. Helpful report Milan rated in India on 5 August 2023 color: BB 15 Verified purchase Nice product, helpful report Shabbirhussain good value for money.Reviewed in India On 19 December 2023colour: db15Verified purchase Little bit loose but awesome product'
		//   };

		getReview = JSON.stringify(getReview);
		res.send(getReview);
	}
	catch (err) {
		console.error("An error occurred:", err);
		res.status(500);
	}


})
app.listen(8000, () => {
	console.log("server is running");
})