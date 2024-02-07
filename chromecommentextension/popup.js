const endpointURL = 'http://localhost:8000/getReview';
let scraping = document.getElementById("clickEndpoint1");
const myParagraph1 = document.getElementById("descriptionWorks");
const myParagraph2 = document.getElementById("descriptionFails");
const page1 = document.getElementById('biasChecker');
const page2 = document.getElementById('priceChecker');
let summaryBox = null;
myParagraph1.textContent = 'vdfsb';
const headers = {
	'Content-Type': 'application/json',
	'Access-Control-Allow-Origin': '*'
};
document.getElementById('goToPrice').addEventListener('click', async () => {
	page1.classList.toggle('visually-hidden');
	page2.classList.toggle('visually-hidden');
})
document.getElementById('goToBias').addEventListener('click', async () => {
	page1.classList.toggle('visually-hidden');
	page2.classList.toggle('visually-hidden');
})
scraping.addEventListener("click", async () => {
	myParagraph1.classList.add('visually-hidden');
	myParagraph2.classList.add('visually-hidden');
	document.getElementById('summaryBox').classList.add('visually-hidden');
	document.getElementById('summaryBox').textContent = '';
	document.getElementById('botsBox').classList.add('visually-hidden');
	document.getElementById('botsBox').textContent = '';
	scraping.disabled = true;
	chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
		let web = 0;
		var currentUrl = tabs[0].url;
		myParagraph1.textContent = currentUrl;
		if (currentUrl.search('www.amazon') == -1) {
			if (currentUrl.search('localhost:3000') == -1) {
				scraping.disabled = false;
				myParagraph2.classList.remove('visually-hidden');
				myParagraph2.textContent = 'Not on a valid website!';
				return;
			}
			else {
				web = 1;
			}
		}
		const postData = {
			url: currentUrl,
			web: web
		};
		try {
			let data = await fetch(endpointURL, {
				method: 'POST',
				headers: headers,
				body: JSON.stringify(postData),
			})
			console.log(data);
			if (!data.ok) {
				throw new Error('Bad fetch response')
			}
			data = await data.json();
			myParagraph1.innerHTML = '<label class="text-info" style="font-size:10px;" for="summaryCheck" >See Summary</label > <input class="form-check-inline" type="checkbox" id="summaryCheck" style="height:10px;width:10px;"><br>';
			myParagraph1.innerHTML += '<span >The predicted ratings according to the reviews are: </span><br>';
			let strs = []

			for (let v of data.bias) {
				v.score = parseFloat(v.score.toFixed(3));
				strs.push('<div class="col-6 m-0 p-0 star-rating" style="width: 100%;">' +
					v.label + ' : <span>' + v.score + '</span></div>' +
					'<div class="col-6 m-0 p-0" style="width: 100%;"><input class="form-control-range m-0 p-0" type="range" min="0" max="1" step="0.001" value="' + v.score +
					' %" disabled style="width: 75%; height: 2px; background: linear-gradient(90deg, #673AB7 ' + (v.score * 100) + '%, #aaaaaa ' + (v.score * 100) + '%); appearance: none;-moz-appearance:none;">' +
					'</div>');
			}
			for (let v of strs) {
				myParagraph1.innerHTML += v;
			}
			myParagraph1.classList.remove('visually-hidden');
			summaryBox = document.getElementById("summaryCheck");
			summaryBox.addEventListener('click', async () => {
				document.getElementById('summaryBox').classList.toggle('visually-hidden');
			})
			document.getElementById('botsBox').classList.remove('visually-hidden');
			document.getElementById('botsBox').textContent = data.botsFound;
			document.getElementById('summaryBox').innerHTML = data.summary;

		}
		catch (err) {
			myParagraph2.textContent = err;
			myParagraph2.classList.remove('visually-hidden');
		} finally {
			scraping.disabled = false;
		}
	})
})