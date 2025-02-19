function init() {

}

function parseData() {
    const tabDelimitedData = document.getElementById("datatext").value;
    const parsedData = getParsedData(tabDelimitedData);
    // Sort by date;
    parsedData.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    const groupedData = groupByLocationAndAgency(parsedData);
    console.log(groupedData);
    // const formattedGroupedData = formatGroupedData(groupedData);

    // for (const data of formattedGroupedData) {
    //     document.getElementById('content').innerHTML += data + "<br>";
    // }

    const tableData = formatGroupedDataForTable(groupedData)   

    // Insert the table into the DOM
    const table = generateTable(tableData);
    document.body.appendChild(table);

}

// Generate the HTML table
function generateTable(data) {
    // const table = document.createElement('table');

    const table = document.getElementById('outputTable');

    while (table.hasChildNodes()) {
        table.removeChild(table.firstChild);
    }
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    table.style.border = '1px solid black';

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ['Start Date', 'End Date', 'Location', 'Agency', 'Services', 'Diagnoses'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.border = '1px solid black';
        th.style.padding = '8px';
        th.style.backgroundColor = '#f2f2f2';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    data.forEach(item => {
        const row = document.createElement('tr');
        Object.values(item).forEach(text => {
            const td = document.createElement('td');
            td.textContent = text;
            td.style.border = '1px solid black';
            td.style.padding = '8px';
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    return table;
}

function formatGroupedDataForTable(groupedData) {
    // Format the data for the table
    return Object.values(groupedData).map(range => {
        // Format services with counts
        const services = Object.entries(range.services)
            .map(([service, count]) => `${service} (${count})`)
            .join(', ');

        // Format diagnoses with counts
        const diagnoses = Object.entries(range.diagnoses)
            .map(([diagnosis, count]) => `${diagnosis} (${count})`)
            .join(', ');

        return {
            startDate: range.startDate,
            endDate: range.endDate,
            Location: range.Location,
            Agency: range.Agency,
            Services: services,
            Diagnoses: diagnoses
        };
    });
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

// This was when I thought it needed to be a list of dates
// and have a new row every time they change location.
function groupByLocationAndAgency2(sortedData) {

    var prevRow = sortedData[0];
    const groupedData = [];
    const cptCode = prevRow['CPT Code'];
    const principleDiagnosis = prevRow['Principle Diagnosis'];
    const additionalDiagnosis2 = prevRow['Additional Diagnosis 2'];
    const additionalDiagnosis3 = prevRow['Additional Diagnosis 3'];
    const additionalDiagnosis4 = prevRow['Additional Diagnosis 4'];
    groupedData.push(
        {
            startDate: prevRow.Date,
            endDate: prevRow.Date,
            Location: prevRow.Location,
            Agency: prevRow.Agency,
            services: {cptCode : 1},
            diagnosis: {
                principleDiagnosis : 1,
                additionalDiagnosis2 : 1,
                additionalDiagnosis3 : 1,
                additionalDiagnosis4 : 1
            }
        }
    );
    for (const row of sortedData.slice(1)) {
        groupedDataRow = groupedData.at(-1);
        if (row.Location === prevRow.Location && row.Agency === prevRow.Agency) {
            groupedDataRow.endDate = row.Date;
        } else {
            groupedDataRow =
                {
                    startDate: row.Date,
                    endDate: row.Date,
                    Location: row.Location,
                    Agency: row.Agency,
                    services: {},
                    diagnosis: {}
                };
            groupedData.push(groupedDataRow);
        }
        const services = groupedDataRow.services;
        if (!services[row['CPT Code']]) {
            services[row['CPT Code']] = 1;
        } else {
            services[row['CPT Code']]++;
        }
        for (const diagnosis of [row['Principle Diagnosis'],
                                    row['Additional Diagnosis 2'],
                                    row['Additional Diagnosis 3'],
                                    row['Additional Diagnosis 4']]) {
            const diagnosisList = groupedDataRow.diagnosis;
            if (!diagnosisList[row[diagnosis]]) {
                diagnosisList[row[diagnosis]] = 1;
            } else {
                diagnosisList[row[diagnosis]]++;
            }
        }
        prevRow = row;
    }

    console.log(groupedData);
    return groupedData;
}

// This was when I thought it needed to be a list of dates
// and have a new row every time they change location.
function formatGroupedData2(groupedData) {
    // Format the output
    const formattedData = Object.values(groupedData).map(range => {
        // Format services with counts
        const services = Object.entries(range.services)
            .map(([service, count]) => `${service} (${count})`)
            .join(', ');

        // Format diagnoses with counts
        const diagnoses = Object.entries(range.diagnosis)
            .map(([diagnosis, count]) => `${diagnosis} (${count})`)
            .join(', ');

    return `${range.startDate} to ${range.endDate} - ${range.Location} - ${range.Agency} | Services: ${services} | Diagnoses: ${diagnoses}`;
});

    console.log(formattedData);
    return formattedData;
}

window.onloc = function() {
    init();
}