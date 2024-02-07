//State script
let state = ["Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttarakhand",
    "Uttar Pradesh",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli",
    "Daman and Diu",
    "Delhi",
    "Lakshadweep",
    "Puducherry"]
const select = document.getElementById('stateSelect');
for (let k of state) {
    const node = document.createElement('option');
    node.textContent = k;
    select.appendChild(node);
}

//Button Group Script
Array.from(document.getElementsByClassName('myButton')).forEach(element => {
    element.addEventListener('click', () => {
        let isSet = element.classList.contains('btn-primary');
        Array.from(document.getElementsByClassName('myButton')).forEach(ele => {
            if (element == ele) {
                if (!isSet) {
                    ele.classList.remove('btn-secondary');
                    ele.classList.add('btn-primary');
                }
            } else {
                ele.classList.remove('btn-primary');
                ele.classList.add('btn-secondary');
            }
        })
    })
});

document.getElementsByClassName('myButton')[0].addEventListener('click', () => {
    const mine = document.getElementById('submitDataForm');
    const notmine = [document.getElementById('analyticsDiv'), document.getElementById('predictDiv')];
    let isShown = !mine.classList.contains('visually-hidden');
    if (!isShown) {
        mine.classList.toggle('visually-hidden');
        for (let k of notmine) if (!k.classList.contains('visually-hidden')) k.classList.add('visually-hidden');
    }
})

document.getElementsByClassName('myButton')[1].addEventListener('click', () => {
    const mine = document.getElementById('analyticsDiv');
    const notmine = [document.getElementById('submitDataForm'), document.getElementById('predictDiv')];
    let isShown = !mine.classList.contains('visually-hidden');
    if (!isShown) {
        mine.classList.toggle('visually-hidden');
        for (let k of notmine) if (!k.classList.contains('visually-hidden')) k.classList.add('visually-hidden');
    }
})

document.getElementsByClassName('myButton')[2].addEventListener('click', () => {
    const mine = document.getElementById('predictDiv');
    const notmine = [document.getElementById('analyticsDiv'), document.getElementById('submitDataForm')];
    let isShown = !mine.classList.contains('visually-hidden');
    if (!isShown) {
        mine.classList.toggle('visually-hidden');
        for (let k of notmine) if (!k.classList.contains('visually-hidden')) k.classList.add('visually-hidden');
    }
})

document.getElementById('submitData').addEventListener('click', async () => {
    let url = await chrome.tabs.query({ active: true, currentWindow: true });
    url = url[0].url;
    document.getElementById('submitData').disabled = true;
    try {
        fetch('http://localhost:8000/submitPrice', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                Url: url,
                shownPrice: document.getElementById('shownPrice').value,
                deliveryPrice: document.getElementById('deliveryPrice').value,
                missPrice: document.getElementById('missPrice').value,
                selectedState: document.getElementById('stateSelect').value
            }),
        })
    } catch (err) {
        console.log(err);
    } finally {
        document.getElementById('submitData').disabled = false;
    }
})