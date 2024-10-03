
        // Function to read the Excel file using FileReader
        function readFile(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                    resolve(sheetData);
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        }

        // Function to display Excel data in HTML tables
        function displayExcelData(sheetData, tableId) {
            const tableHead = document.querySelector(`${tableId} thead`);
            const tableBody = document.querySelector(`${tableId} tbody`);

            // Clear any existing content
            tableHead.innerHTML = '';
            tableBody.innerHTML = '';

            // If there's data, populate the table
            if (sheetData.length) {
                // Create the header row
                const headerRow = document.createElement('tr');
                sheetData[0].forEach(headerText => {
                    const headerCell = document.createElement('th');
                    headerCell.textContent = headerText;
                    headerRow.appendChild(headerCell);
                });
                tableHead.appendChild(headerRow);

                // Create the body rows
                sheetData.slice(1).forEach(rowData => {
                    const row = document.createElement('tr');
                    rowData.forEach(cellData => {
                        const cell = document.createElement('td');
                        cell.textContent = cellData || ''; // Handle empty cells
                        row.appendChild(cell);
                    });
                    tableBody.appendChild(row);
                });
            }
        }

        // Merge two Excel sheets
        function mergeSheets(data1, data2) {
            const headers1 = data1[0];
            const headers2 = data2[0];
            if (JSON.stringify(headers1) !== JSON.stringify(headers2)) {
                alert("The two files have different structures. Merging is not possible.");
                return null;
            }

            return [...data1, ...data2.slice(1)]; // Merge excluding second file's header row
        }

        // Function to download the merged Excel file
        function downloadMergedFile(mergedData) {
            const worksheet = XLSX.utils.aoa_to_sheet(mergedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "MergedSheet");

            const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
            const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'merged_file.xlsx';
            a.click();
            URL.revokeObjectURL(url);
        }

        function s2ab(s) {
            const buf = new ArrayBuffer(s.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < s.length; i++) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }
            return buf;
        }

        // Display file data immediately after file selection
        document.getElementById('file1').addEventListener('change', function(event) {
            const file1Input = event.target.files[0];
            if (file1Input) {
                readFile(file1Input).then(data1 => {
                    displayExcelData(data1, "#excelTable1");
                });
            }
        });

        document.getElementById('file2').addEventListener('change', function(event) {
            const file2Input = event.target.files[0];
            if (file2Input) {
                readFile(file2Input).then(data2 => {
                    displayExcelData(data2, "#excelTable2");
                });
            }
        });

        // Merge and download the files on button click
        document.getElementById('mergeButton').addEventListener('click', function() {
            const file1Input = document.getElementById('file1').files[0];
            const file2Input = document.getElementById('file2').files[0];

            if (file1Input && file2Input) {
                Promise.all([readFile(file1Input), readFile(file2Input)]).then(values => {
                    const [data1, data2] = values;

                    // Merge the files after displaying
                    const mergedData = mergeSheets(data1, data2);
                    if (mergedData) {
                        downloadMergedFile(mergedData);
                    }
                });
            } else {
                alert("Please select two files to merge.");
            }
        });
