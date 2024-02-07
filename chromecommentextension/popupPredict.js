const select2 = document.getElementById('stateSelect2');
for (let k of state) {
    const node = document.createElement('option');
    node.textContent = k;
    select2.appendChild(node);
}