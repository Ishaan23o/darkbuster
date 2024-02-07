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

async function init() {
	let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	const handleFunc = async function () {
		let reviews = document.querySelectorAll('[data-hook="review-collapsed"]');
		let reviewTexts = [];
		for (let review of reviews) {
			if (review.childNodes[1].querySelectorAll('span').length != 0) continue;
			let button = document.createElement('span');
			button.classList.add('btn');
			button.classList.add('btn-primary');
			button.style = '--bs-blue: #0d6efd; --bs-indigo: #6610f2; --bs-purple: #6f42c1; --bs-pink: #d63384; --bs-red: #dc3545; --bs-orange: #fd7e14; --bs-yellow: #ffc107; --bs-green: #198754; --bs-teal: #20c997; --bs-cyan: #0dcaf0; --bs-black: #000; --bs-white: #fff; --bs-gray: #6c757d; --bs-gray-dark: #343a40; --bs-gray-100: #f8f9fa; --bs-gray-200: #e9ecef; --bs-gray-300: #dee2e6; --bs-gray-400: #ced4da; --bs-gray-500: #adb5bd; --bs-gray-600: #6c757d; --bs-gray-700: #495057; --bs-gray-800: #343a40; --bs-gray-900: #212529; --bs-primary: #0d6efd; --bs-secondary: #6c757d; --bs-success: #198754; --bs-info: #0dcaf0; --bs-warning: #ffc107; --bs-danger: #dc3545; --bs-light: #f8f9fa; --bs-dark: #212529; --bs-primary-rgb: 13,110,253; --bs-secondary-rgb: 108,117,125; --bs-success-rgb: 25,135,84; --bs-info-rgb: 13,202,240; --bs-warning-rgb: 255,193,7; --bs-danger-rgb: 220,53,69; --bs-light-rgb: 248,249,250; --bs-dark-rgb: 33,37,41; --bs-primary-text-emphasis: #052c65; --bs-secondary-text-emphasis: #2b2f32; --bs-success-text-emphasis: #0a3622; --bs-info-text-emphasis: #055160; --bs-warning-text-emphasis: #664d03; --bs-danger-text-emphasis: #58151c; --bs-light-text-emphasis: #495057; --bs-dark-text-emphasis: #495057; --bs-primary-bg-subtle: #cfe2ff; --bs-secondary-bg-subtle: #e2e3e5; --bs-success-bg-subtle: #d1e7dd; --bs-info-bg-subtle: #cff4fc; --bs-warning-bg-subtle: #fff3cd; --bs-danger-bg-subtle: #f8d7da; --bs-light-bg-subtle: #fcfcfd; --bs-dark-bg-subtle: #ced4da; --bs-primary-border-subtle: #9ec5fe; --bs-secondary-border-subtle: #c4c8cb; --bs-success-border-subtle: #a3cfbb; --bs-info-border-subtle: #9eeaf9; --bs-warning-border-subtle: #ffe69c; --bs-danger-border-subtle: #f1aeb5; --bs-light-border-subtle: #e9ecef; --bs-dark-border-subtle: #adb5bd; --bs-white-rgb: 255,255,255; --bs-black-rgb: 0,0,0; --bs-font-sans-serif: system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue","Noto Sans","Liberation Sans",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"; --bs-font-monospace: SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; --bs-gradient: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0)); --bs-body-font-family: var(--bs-font-sans-serif); --bs-body-font-size: 1rem; --bs-body-font-weight: 400; --bs-body-line-height: 1.5; --bs-body-color: #212529; --bs-body-color-rgb: 33,37,41; --bs-body-bg: #fff; --bs-body-bg-rgb: 255,255,255; --bs-emphasis-color: #000; --bs-emphasis-color-rgb: 0,0,0; --bs-secondary-color: rgba(33, 37, 41, 0.75); --bs-secondary-color-rgb: 33,37,41; --bs-secondary-bg: #e9ecef; --bs-secondary-bg-rgb: 233,236,239; --bs-tertiary-color: rgba(33, 37, 41, 0.5); --bs-tertiary-color-rgb: 33,37,41; --bs-tertiary-bg: #f8f9fa; --bs-tertiary-bg-rgb: 248,249,250; --bs-heading-color: inherit; --bs-link-color: #0d6efd; --bs-link-color-rgb: 13,110,253; --bs-link-decoration: underline; --bs-link-hover-color: #0a58ca; --bs-link-hover-color-rgb: 10,88,202; --bs-code-color: #d63384; --bs-highlight-color: #212529; --bs-highlight-bg: #fff3cd; --bs-border-width: 1px; --bs-border-style: solid; --bs-border-color: #dee2e6; --bs-border-color-translucent: rgba(0, 0, 0, 0.175); --bs-border-radius: 0.375rem; --bs-border-radius-sm: 0.25rem; --bs-border-radius-lg: 0.5rem; --bs-border-radius-xl: 1rem; --bs-border-radius-xxl: 2rem; --bs-border-radius-2xl: var(--bs-border-radius-xxl); --bs-border-radius-pill: 50rem; --bs-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15); --bs-box-shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075); --bs-box-shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175); --bs-box-shadow-inset: inset 0 1px 2px rgba(0, 0, 0, 0.075); --bs-focus-ring-width: 0.25rem; --bs-focus-ring-opacity: 0.25; --bs-focus-ring-color: rgba(13, 110, 253, 0.25); --bs-form-valid-color: #198754; --bs-form-valid-border-color: #198754; --bs-form-invalid-color: #dc3545; --bs-form-invalid-border-color: #dc3545; --bs-breakpoint-xs: 0; --bs-breakpoint-sm: 576px; --bs-breakpoint-md: 768px; --bs-breakpoint-lg: 992px; --bs-breakpoint-xl: 1200px; --bs-breakpoint-xxl: 1400px; -webkit-text-size-adjust: 100%; -webkit-tap-highlight-color: transparent; box-sizing: border-box; text-transform: none; -webkit-appearance: button; --bs-btn-padding-x: 0.75rem; --bs-btn-padding-y: 0.375rem; --bs-btn-font-family: ; --bs-btn-font-size: 1rem; --bs-btn-font-weight: 400; --bs-btn-line-height: 1.5; --bs-btn-border-width: var(--bs-border-width); --bs-btn-border-radius: var(--bs-border-radius); --bs-btn-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15),0 1px 1px rgba(0, 0, 0, 0.075); --bs-btn-disabled-opacity: 0.65; --bs-btn-focus-box-shadow: 0 0 0 0.25rem rgba(var(--bs-btn-focus-shadow-rgb), .5); display: inline-block; padding: var(--bs-btn-padding-y) var(--bs-btn-padding-x); font-family: var(--bs-btn-font-family); font-size: var(--bs-btn-font-size); font-weight: var(--bs-btn-font-weight); line-height: var(--bs-btn-line-height); color: var(--bs-btn-color); text-align: center; text-decoration: none; vertical-align: middle; user-select: none; border: var(--bs-btn-border-width) solid var(--bs-btn-border-color); border-radius: var(--bs-btn-border-radius); background-color: var(--bs-btn-bg); transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; --bs-btn-color: #fff; --bs-btn-bg: #0d6efd; --bs-btn-border-color: #0d6efd; --bs-btn-hover-color: #fff; --bs-btn-hover-bg: #0b5ed7; --bs-btn-hover-border-color: #0a58ca; --bs-btn-focus-shadow-rgb: 49,132,253; --bs-btn-active-color: #fff; --bs-btn-active-bg: #0a58ca; --bs-btn-active-border-color: #0a53be; --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125); --bs-btn-disabled-color: #fff; --bs-btn-disabled-bg: #0d6efd; --bs-btn-disabled-border-color: #0d6efd; margin: 0!important; cursor: pointer;';
			button.textContent = 'See Review Analysis';
			reviewTexts.push(review.textContent.trim());
			review.childNodes[1].appendChild(button);
		}
		console.log(reviewTexts);
		chrome.runtime.sendMessage({ type: "reviewTexts", data: reviewTexts });
	};
	await chrome.scripting.executeScript({
		target: { tabId: tabs[0].id },
		function: handleFunc,
	});
}

document.addEventListener("DOMContentLoaded", (event) => {
	init()
});

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
	if (message.type === "reviewTexts") {
		promises = []
		for (let messages of message.data) {
			promises.push(fetch('http://localhost:8000/getSentiment', {
				method: 'POST',
				headers: headers,
				body: JSON.stringify({ text: messages })
			}))
		}
		let result = await Promise.all(promises);
		let arrnew = []
		for (let k of result) {
			k = await k.json();
			arrnew.push(k)
		}
		init2(arrnew);
	}
});

async function init2(data) {
	let tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	console.log(data);
	const handleFuncer = async function (data) {
		let reviews = Array.from(document.querySelectorAll('[data-hook="review-collapsed"]'));
		let arr = []
		for (let i = 0; i < reviews.length; i++) {
			arr.push({ review: reviews[i], data: data[i] });
		}
		console.log(arr)
		for (let { review, data } of arr) {
			const div = document.createElement('div');
			const button = review.childNodes[1].querySelectorAll('span')[0];
			div.style.display = 'none';
			review.appendChild(div);
			button.addEventListener('mouseover', () => {
				div.style.display = 'block';
			})
			button.addEventListener('mouseout', () => {
				div.style.display = 'none';
			})
			div.innerHTML = `Score: ${data.score} <br>Sentiment: ${data.sentiment}`

		}
	};
	await chrome.scripting.executeScript({
		target: { tabId: tabs[0].id },
		function: handleFuncer,
		args: [data]
	});
}
