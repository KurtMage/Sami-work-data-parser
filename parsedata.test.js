const { TextEncoder, TextDecoder } = require('text-encoding');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

// Load the HTML file
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Parser</title>
</head>
<body>
    <textarea id="datatext"></textarea>
    <button id="parseButton" onclick="parseData()">Parse Data</button>
    <table id=outputTable class="tableFormat"></table>
    <script src="./parsedata.js"></script>
</body>
</html>
`;

// Set up jsdom
let dom;
let document;

beforeEach(() => {
    // Create a new jsdom instance with the HTML
    dom = new JSDOM(html, { runScripts: 'dangerously' });
    document = dom.window.document;

    // Mock the global `document` and `window` objects
    global.document = document;
    global.window = dom.window;

    // Add the script to the jsdom environment
    const script = fs.readFileSync(path.resolve(__dirname, './parsedata.js'), 'utf8');
    const scriptElement = document.createElement('script');
    scriptElement.textContent = script;
    document.body.appendChild(scriptElement);
});

describe('parseData', () => {
    it('should create a table with the correct data', () => {
        // Set up the input data in the textarea
        const inputData = `
RSN\\BHO	Agency	Claim Submit Identifier	Date	Location	CPT Code	Minutes	Principle Diagnosis	Additional Diagnosis 2	Additional Diagnosis 3	Additional Diagnosis 4	EPSDT Indicator	PIC or MMIS ID	Service Provider Type
411 - King County	10426 - EVERGREEN TREATMENT SERVICE	33333333	03/21/2017	Non residential Substance Abuse Treatment Facility	H0010 - Alcohol or drug use	5	F11.10 - Opiod abuse, uncomplicated	None	None	None		101184560WA	
411 - King County	10426 - EVERGREEN TREATMENT SERVICE	33333333	04/21/2016	Non residential Substance Abuse Treatment Facility	H0011 - Some other service	5	F11.10 - Opiod abuse, uncomplicated	None	None	None		101184560WA	
411 - King County	10426 - EVERGREEN TREATMENT SERVICE	33333333	02/21/2016	Non residential Substance Abuse Treatment Facility	H0010 - Alcohol or drug use	5	F11.10 - Opiod abuse, uncomplicated	None	None	None		101184560WA
411 - King County	22222 - TREATMENT2SERVICE	33333333	05/21/2016	Non residential Substance Abuse Treatment Facility	H0010 - Alcohol or drug use	5	F11.10 - Opiod abuse, uncomplicated	None	None	None		101184560WA
`;
        document.getElementById('datatext').value = inputData;

        // Trigger the parseData function
        document.getElementById('parseButton').click();

        // Verify the table was created
        const table = document.querySelector('table');
        expect(table).not.toBeNull();

        // Verify the table headers
        const headers = table.querySelectorAll('th');
        expect(headers.length).toBe(6); // Updated to match the actual number of headers
        expect(headers[0].textContent).toBe('Start Date');
        expect(headers[1].textContent).toBe('End Date');
        expect(headers[2].textContent).toBe('Location');
        expect(headers[3].textContent).toBe('Agency');
        expect(headers[4].textContent).toBe('Services');
        expect(headers[5].textContent).toBe('Diagnoses');

        // Verify the table rows
        const rows = table.querySelectorAll('tbody tr');
        expect(rows.length).toBe(2); // Adjust based on your expected output

        // Verify the first row
        const firstRowCells = rows[0].querySelectorAll('td');
        expect(firstRowCells[0].textContent).toBe('02/21/2016');
        expect(firstRowCells[1].textContent).toBe('03/21/2017');
        expect(firstRowCells[2].textContent).toBe('Non residential Substance Abuse Treatment Facility');
        expect(firstRowCells[3].textContent).toBe('10426 - EVERGREEN TREATMENT SERVICE');
        expect(firstRowCells[4].textContent).toBe('H0010 - Alcohol or drug use (2),\n\nH0011 - Some other service (1)');
        expect(firstRowCells[5].textContent).toBe('F11.10 - Opiod abuse, uncomplicated (3)');

        // Verify the second row
        const secondRowCells = rows[1].querySelectorAll('td');
        expect(secondRowCells[0].textContent).toBe('05/21/2016');
        expect(secondRowCells[1].textContent).toBe('05/21/2016');
        expect(secondRowCells[2].textContent).toBe('Non residential Substance Abuse Treatment Facility');
        expect(secondRowCells[3].textContent).toBe('22222 - TREATMENT2SERVICE');
        expect(secondRowCells[4].textContent).toBe('H0010 - Alcohol or drug use (1)');
        expect(secondRowCells[5].textContent).toBe('F11.10 - Opiod abuse, uncomplicated (1)');
    });

    it('should handle empty input data', () => {
        // Set up empty input data
        document.getElementById('datatext').value = '';

        // Trigger the parseData function
        document.getElementById('parseButton').click();

        // Verify the table exists but has no rows
        const table = document.querySelector('table');
        expect(table).not.toBeNull();

        // Verify the table has no rows in the tbody
        const rows = table.querySelectorAll('tbody tr');
        expect(rows.length).toBe(0);
    });

});