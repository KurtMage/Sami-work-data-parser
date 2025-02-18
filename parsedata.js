function init() {

}

function parseData() {
    const tabDelimitedData = document.getElementById("datatext").value;
    const parsedData = getParsedData(tabDelimitedData);
    // Sort by date;
    parsedData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    const groupedData = groupByLocationAndAgency(parsedData);
    formatGroupedData(groupedData);

}

function formatGroupedData(groupedData) {
    const formattedData = Object.values(groupedData)
        .flatMap(ranges => {
            return ranges.map(range => {
                const services = Array.from(range.services).join(', ');
                const diagnoses = Array.from(range.diagnoses).join(', ');
                return {
                    startDate: range.startDate,
                    formattedString: `${range.startDate} to ${range.endDate} - ${range.Location} - ${range.Agency} | Services: ${services} | Diagnoses: ${diagnoses}`
                };
            });
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) // Sort by startDate
        .map(item => item.formattedString); // Extract the formatted string

    console.log(formattedData);
    return formattedData;
}

function groupByLocationAndAgency(sortedData) {
    const groupedData = sortedData.reduce((acc, row) => {
        const location = row.Location;
        const agency = row.Agency;
        const currentDate = new Date(row.Date);

        // Create a unique key for Location + Agency
        const key = `${location}|${agency}`;

        // Initialize key if it doesn't exist
        if (!acc[key]) {
            acc[key] = [];
        }

        // Get the last range for this key
        const lastRange = acc[key][acc[key].length - 1];

        // If the current date is contiguous with the last range, extend the range and update services/diagnoses
        if (lastRange && new Date(lastRange.endDate) >= currentDate) {
            lastRange.endDate = row.Date;
            lastRange.services.add(row.Service);
            lastRange.diagnoses.add(row.Diagnosis);
        } else {
            // Otherwise, add a new range
            acc[key].push({
                startDate: row.Date,
                endDate: row.Date,
                Location: location,
                Agency: agency,
                services: new Set([row.Service]),
                diagnoses: new Set([row.Diagnosis])
            });
        }

        return acc;
    }, {});

    console.log(groupedData);
    return groupedData;
}

function getParsedData(tabDelimitedData) {
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
    return rowsObjects;
}

window.onloc = function() {
    init();
}