function init() {

}

function parseData() {
    const tabDelimitedData = document.getElementById("datatext").value;
    const parsedData = getParsedData(tabDelimitedData);
    // Sort by date;
    parsedData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    const groupedData = groupByLocationAndAgency(parsedData);
    const formattedGroupedData = formatGroupedData(groupedData);

    for (const data of formattedGroupedData) {
        document.getElementById('content').innerHTML += data + "<br>";
    }

}

function formatGroupedData(groupedData) {
    // Format the output
    const formattedData = Object.values(groupedData).map(range => {
        // Format services with counts
        const services = Object.entries(range.services)
            .map(([service, count]) => `${service} (${count})`)
            .join(', ');

        // Format diagnoses with counts
        const diagnoses = Object.entries(range.diagnoses)
            .map(([diagnosis, count]) => `${diagnosis} (${count})`)
            .join(', ');

    return `${range.startDate} to ${range.endDate} - ${range.Location} - ${range.Agency} | Services: ${services} | Diagnoses: ${diagnoses}`;
});


    console.log(formattedData);
    return formattedData;
}

function groupByLocationAndAgency2(sortedData) {

    const firstRow = sortedData[0];
    const groupedData = [];
    groupedData.push(
        {
            startDate: firstRow.Date,
            endDate: firstRow.Date,
            Location: firstRow.Location,
            Agency: firstRow.Agency,
            services: {},
            diagnosis: {}
        }
    );
    for (const row of sortedData.slice(1)) {

    }

    console.log(groupedData);
    return groupedData;
}

function groupByLocationAndAgency(sortedData) {
    // Group by Location and Agency, and collapse date ranges
    const groupedData = sortedData.reduce((acc, row) => {
        const location = row.Location;
        const agency = row.Agency;
        const currentDate = new Date(row.Date);

        // Create a unique key for Location + Agency
        const key = `${location}|${agency}`;

        // Initialize key if it doesn't exist
        if (!acc[key]) {
            acc[key] = {
                startDate: row.Date,
                endDate: row.Date,
                Location: location,
                Agency: agency,
                services: {},
                diagnoses: {}
            };
        }

        // Get the range for this key
        const range = acc[key];

        // Update the end date if the current date is later
        if (new Date(row.Date) > new Date(range.endDate)) {
            range.endDate = row.Date;
        }

        // Update service counts
        if (!range.services[row['CPT Code']]) {
            range.services[row['CPT Code']] = 1;
        } else {
            range.services[row['CPT Code']]++;
        }

        // Combine all diagnoses into a single list
        const diagnoses = [
            row['Principle Diagnosis'],
            row['Additional Diagnosis 2'],
            row['Additional Diagnosis 3'],
            row['Additional Diagnosis 4']
        ].filter(diagnosis => diagnosis && diagnosis !== 'None'); // Remove empty values and "None"

        // Update diagnosis counts
        diagnoses.forEach(diagnosis => {
            if (!range.diagnoses[diagnosis]) {
                range.diagnoses[diagnosis] = 1;
            } else {
                range.diagnoses[diagnosis]++;
            }
        });

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