function init() {

}

function parseData() {
    const tabDelimitedData = document.getElementById("datatext").value;
    const rows = tabDelimitedData.trim().split('\n');
    const data = rows.map(row => row.split('\t'));

    const headers = data[0];
    rowsData = data.slice(1);

    const rowsObjects = rowsData.map(row => {
        return row.reduce((obj, value, index) => {
            obj[headers[index]] = value;
            return obj;
        }, {});
    })
    console.log(rowsObjects);
}

window.onloc = function() {
    init();
}