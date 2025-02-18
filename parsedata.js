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

            // Update service counts
            if (!lastRange.services[row.Service]) {
                lastRange.services[row.Service] = 1;
            } else {
                lastRange.services[row.Service]++;
            }

            // Combine all diagnoses into a single list
            const diagnoses = [
                row['Principle Diagnosis'],
                row['Additional Diagnosis 2'],
                row['Additional Diagnosis 3'],
                row['Additional Diagnosis 4']
            ].filter(diagnosis => diagnosis); // Remove empty values

            // Update diagnosis counts
            diagnoses.forEach(diagnosis => {
                if (!lastRange.diagnoses[diagnosis]) {
                    lastRange.diagnoses[diagnosis] = 1;
                } else {
                    lastRange.diagnoses[diagnosis]++;
                }
            });
        } else {
            // Otherwise, add a new range
            const diagnoses = [
                row['Principle Diagnosis'],
                row['Additional Diagnosis 2'],
                row['Additional Diagnosis 3'],
                row['Additional Diagnosis 4']
            ].filter(diagnosis => diagnosis); // Remove empty values

            const diagnosisCounts = diagnoses.reduce((acc, diagnosis) => {
                acc[diagnosis] = (acc[diagnosis] || 0) + 1;
                return acc;
            }, {});

            acc[key].push({
                startDate: row.Date,
                endDate: row.Date,
                Location: location,
                Agency: agency,
                services: { [row.Service]: 1 }, // Initialize service counts
                diagnoses: diagnosisCounts // Initialize diagnosis counts
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