document.addEventListener('DOMContentLoaded', function () {
    const addMemberBtn = document.getElementById('addNewMemberBtn');
    const modal = document.getElementById('addMemberModal');
    const closeBtn = modal.querySelector('.close');

    // Add event listeners for the "Add New Member" button and the modal close button
    addMemberBtn.addEventListener('click', () => modal.style.display = 'block');
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

    // Initialize employees array from localStorage or as an empty array
    // This will be used to store employee data
    let employees = JSON.parse(localStorage.getItem("employees")) || [];

    // Save Employees to Local Storage
    // This function will save the current employees array to localStorage
    function saveEmployees() {
        localStorage.setItem("employees", JSON.stringify(employees));
    }

    // Handle Image Upload
    // This function will read the uploaded image file and set it as the value of the picture input
    const uploadImage = document.getElementById("uploadImage");
    uploadImage.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById("picture").value = e.target.result;
                document.querySelector(".imagePreview").src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });


    let currentSort = {
        key: null,
        direction: "asc", // or "desc"
    };

    // Sort Employees
    // This function will sort the employee data based on the current sort key and direction
    function sortEmployees(data) {
        if (!currentSort.key) return data;

        return data.slice().sort((a, b) => {
            const valA = a[currentSort.key];
            const valB = b[currentSort.key];

            if (typeof valA === "string") {
                return currentSort.direction === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            } else {
                return currentSort.direction === "asc"
                    ? valA - valB
                    : valB - valA;
            }
        });
    }
    


    let currentPage = 1;
    let entriesPerPage = parseInt(document.getElementById("table_size").value);

    // Change Entries Per Page
    // This function will update the number of entries displayed per page
    document.getElementById("table_size").addEventListener("change", function () {
        entriesPerPage = parseInt(this.value);
        currentPage = 1;
        displayEmployees();
    });

    // Paginate Data
    // This function will slice the employee data based on the current page and entries per page
    function paginate(data) {
        const start = (currentPage - 1) * entriesPerPage;
        const end = start + entriesPerPage;
        return data.slice(start, end);
    }

    // Generate Pagination
    // This function will create pagination controls based on the total number of items
    // It will create "Prev" and "Next" buttons, as well as page number buttons
    function generatePagination(totalItems) {
        const pagination = document.getElementById("paginationControls");
        const totalPages = Math.ceil(totalItems / entriesPerPage);
        pagination.innerHTML = "";

        if (totalPages <= 1) return;

        // Helper to create a page button
        const createPageBtn = (pageNum, label = null, isEllipsis = false) => {
            const btn = document.createElement("button");
            btn.textContent = label || pageNum;
            btn.disabled = isEllipsis;
            if (!isEllipsis && pageNum === currentPage) {
                btn.classList.add("active");
            }
            if (!isEllipsis) {
                btn.onclick = () => {
                    currentPage = pageNum;
                    displayEmployees();
                    scrollToTableTop();
                };
            }
            pagination.appendChild(btn);
        };

        // Prev Button
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Prev";
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            currentPage--;
            displayEmployees();
            scrollToTableTop();
        };
        pagination.appendChild(prevBtn);

        const visiblePages = 2; // Number of pages to show in the pagination
        const half = Math.floor(visiblePages / 2);

        let startPage = Math.max(1, currentPage - half);
        let endPage = Math.min(totalPages, currentPage + half);

        if (currentPage <= half) {
            endPage = Math.min(totalPages, visiblePages);
        } else if (currentPage + half >= totalPages) {
            startPage = Math.max(1, totalPages - visiblePages + 1);
        }

        // Always show first page
        if (startPage > 1) {
            createPageBtn(1);
            if (startPage > 1) createPageBtn(null, "...", true);
        }

        // Middle pages
        for (let i = startPage; i <= endPage; i++) {
            createPageBtn(i);
        }

        // Always show last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) createPageBtn(null, "...", true);
            createPageBtn(totalPages);
        }

        // Next Button
        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next";
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            currentPage++;
            displayEmployees();
            scrollToTableTop();
        };
        pagination.appendChild(nextBtn);


        document.addEventListener("keydown", function (e) {
            if (e.key === "ArrowLeft" && currentPage > 1) {
                currentPage--;
                displayEmployees();
                scrollToTableTop();
            } else if (e.key === "ArrowRight" && currentPage < totalPages) {
                currentPage++;
                displayEmployees();
                scrollToTableTop();
            }
        });



    }

    
    // Scroll to Table Top
    // This function will scroll the window to the top of the employee table
    function scrollToTableTop() {
        const table = document.getElementById("employeeTable");
        if (table) {
            table.scrollIntoView({ behavior: "smooth" });
        }
    }


    // Display Employees
    // This function will filter, sort, and paginate the employee data, then display it in the table
    function displayEmployees() {
        const searchTerm = document.getElementById("search").value.toLowerCase();
        const tbody = document.getElementById("employeeTableBody");
        const cardsContainer = document.getElementById("employeeCardsContainer");

        tbody.innerHTML = "";
        cardsContainer.innerHTML = "";

        let filteredEmployees = employees.filter(emp => {
            return (
                emp.fullName.toLowerCase().includes(searchTerm) ||
                emp.county.toLowerCase().includes(searchTerm) ||
                emp.position.toLowerCase().includes(searchTerm)
            );
        });

        filteredEmployees = sortEmployees(filteredEmployees);

        const paginatedData = paginate(filteredEmployees);

        // If no employees match the search criteria, display a message
        // If paginatedData is empty, show a message
        if (paginatedData.length === 0) {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 11;
            td.textContent = "No matching records found.";
            row.appendChild(td);
            tbody.appendChild(row);
        } else {
            paginatedData.forEach((emp, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${(currentPage - 1) * entriesPerPage + index + 1}</td>
                    <td><img src="${emp.picture}" alt="Pic" width="40" height="40"></td>
                    <td>${emp.fullName}</td>
                    <td>${emp.age}</td>
                    <td>${emp.county}</td>
                    <td>${emp.position}</td>
                    <td>Ksh${emp.salary}</td>
                    <td>${emp.startDate}</td>
                    <td>${emp.email}</td>
                    <td>${emp.phone}</td>
                    <td class="action-buttons">
                        <button onclick="viewEmployee(${employees.indexOf(emp)})">View</button>
                        <button onclick="editEmployee(${employees.indexOf(emp)})">Edit</button>
                        <button onclick="deleteEmployee(${employees.indexOf(emp)})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);


                // Card View (for mobile)
                const card = document.createElement("div");
                card.className = "employee-card";
                card.innerHTML = `
                    <div class="field"><span>#:</span> ${(currentPage - 1) * entriesPerPage + index + 1}</div>
                    <div class="field"><span>Name:</span> ${emp.name}</div>
                    <div class="field"><span>Age:</span> ${emp.age}</div>
                    <div class="field"><span>County:</span> ${emp.county}</div>
                    <div class="field"><span>Position:</span> ${emp.position}</div>
                    <div class="field"><span>Salary:</span> Ksh${emp.salary}</div>
                    <div class="field"><span>Start Date:</span> ${emp.startDate}</div>
                    <div class="field"><span>Email:</span> ${emp.email}</div>
                    <div class="field"><span>Phone:</span> ${emp.phone}</div>
                    
                    <div class="action-buttons">
                        <button onclick="viewEmployee(${employees.indexOf(emp)})">View</button>
                        <button onclick="editEmployee(${employees.indexOf(emp)})">Edit</button>
                        <button onclick="deleteEmployee(${employees.indexOf(emp)})">Delete</button>
                    </div>
                `;
                cardsContainer.appendChild(card);
            });
        }

        // Update the current page number
        // Update "Showing X to Y of Z entries"
        const from = filteredEmployees.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1;
        const to = Math.min(currentPage * entriesPerPage, filteredEmployees.length);
        const showingText = `Showing ${from} to ${to} of ${filteredEmployees.length} entries`;
        document.getElementById("showingEntries").textContent = showingText;

        generatePagination(filteredEmployees.length);
    }


    // Get Form Data
    // This function will collect data from the form fields and return it as an object
    function getFormData() {
        return {
            fullName: document.getElementById("fullName").value,
            age: document.getElementById("age").value,
            county: document.getElementById("county").value,
            position: document.getElementById("position").value,
            salary: document.getElementById("salary").value,
            startDate: document.getElementById("startDate").value,
            email: document.getElementById("email").value,
            phone: document.getElementById("phone").value,
            picture: document.getElementById("picture").value
        };
    }

    // Clear Form Data
    // This function will reset the form fields and the image preview
    function clearForm() {
        document.getElementById("addMemberForm").reset();
        document.getElementById("picture").value = "";
        document.querySelector(".imagePreview").src = "me.jpg";
    }

    // Add Employee Data
    // This function will collect data from the form and add it to the employees array
    function addEmployee() {
        const emp = getFormData();
        if (emp.fullName && emp.email) {
            employees.push(emp);
            saveEmployees();
            displayEmployees();
            clearForm();
        } else {
            alert("Full Name and Email are required.");
        }
    }

    // Delete Employee Data
    // This function will remove an employee from the list after confirmation
    window.deleteEmployee = function(index) {
        if (confirm("Are you sure you want to delete this employee?")) {
            employees.splice(index, 1);
            saveEmployees();
            displayEmployees();
        }
    }

    // Edit Employee details
    // This function will populate the form with the employee's data for editing
    // After editing, it will remove the current employee and wait to add the modified one
    window.editEmployee = function(index) {
        const emp = employees[index];
        document.getElementById("fullName").value = emp.fullName;
        document.getElementById("age").value = emp.age;
        document.getElementById("county").value = emp.county;
        document.getElementById("position").value = emp.position;
        document.getElementById("salary").value = emp.salary;
        document.getElementById("startDate").value = emp.startDate;
        document.getElementById("email").value = emp.email;
        document.getElementById("phone").value = emp.phone;
        document.getElementById("picture").value = emp.picture;
        document.querySelector(".imagePreview").src = emp.picture;

        // Remove current employee, wait to add modified one
        employees.splice(index, 1);
        modal.style.display = "block";
        displayEmployees();
    }

    // View Employee Modal Data
    // This function will display the employee's details in a modal when the "View" button is clicked
    // It will populate the modal with the employee's picture and details
    window.viewEmployee = function(index) {
        const emp = employees[index];
        const modal = document.getElementById('viewEmployeeModal');
        const img = document.getElementById('viewEmployeeImage');
        const detailsDiv = document.getElementById('viewEmployeeDetails');

        img.src = emp.picture;
        detailsDiv.innerHTML = `
            <p><strong>Full Name:</strong> ${emp.fullName}</p>
            <p><strong>Age:</strong> ${emp.age}</p>
            <p><strong>County:</strong> ${emp.county}</p>
            <p><strong>Position:</strong> ${emp.position}</p>
            <p><strong>Salary:</strong> $${emp.salary}</p>
            <p><strong>Start Date:</strong> ${emp.startDate}</p>
            <p><strong>Email:</strong> ${emp.email}</p>
            <p><strong>Phone:</strong> ${emp.phone}</p>
        `;

        modal.style.display = 'block';
    };

    // Add event listener for the "Add Employee" button
    // This will open the modal for adding a new employee
    document.getElementById('addEmployeeBtn').addEventListener('click', function (e) {
        const modal = document.getElementById('addMemberModal');
        e.preventDefault();
        addEmployee();
        modal.style.display = 'none';
    });

    // Add event listener for the search input
    // This will allow users to filter employees by name, county, or position
    let searchTimeout;
    document.getElementById('search').addEventListener('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            displayEmployees();
        }, 300); 
    });

    // Add event listener for the table size dropdown
    // This will allow users to change the number of entries displayed per page
    document.getElementById('table_size').addEventListener('change', displayEmployees);



    
    // Add sort event listeners
    let previousSortedTh = null;

    document.querySelectorAll("th[data-sort]").forEach(th => {
        th.addEventListener("click", function () {
            const sortKey = this.getAttribute("data-sort");

            // Toggle sort direction
            if (currentSort.key === sortKey) {
                currentSort.direction = currentSort.direction === "asc" ? "desc" : "asc";
            } else {
                currentSort.key = sortKey;
                currentSort.direction = "asc";
            }

            updateSortIcons(this);
            displayEmployees(); // sort and render your table
        });
    });

    function updateSortIcons(clickedTh) {
        if (previousSortedTh && previousSortedTh !== clickedTh) {
            const prevIcon = previousSortedTh.querySelector(".sort-icon");
            if (prevIcon) {
                prevIcon.textContent = "▼"; 
                prevIcon.classList.remove('active');
            }
        }

        const icon = clickedTh.querySelector(".sort-icon");
        if (icon) {
            icon.textContent = currentSort.direction === "asc" ? "▲" : "▼";
            icon.classList.add('active');
        }

        previousSortedTh = clickedTh;
    }



    // Initial display of employees
    displayEmployees();

    // View Employee Modal
    const viewModal = document.getElementById('viewEmployeeModal');
    const closeViewBtn = document.querySelector('.close-view');
    closeViewBtn.addEventListener('click', () => viewModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === viewModal) viewModal.style.display = 'none';
    });


    // Export to CSV
    // This function will convert the employee data into CSV format and trigger a download
    function exportToCSV(filename, rows) {
        if (!rows.length) return;

        // Remove "picture" key from each row
        const cleanedRows = rows.map(({ picture, ...rest }) => rest);
        const headers = Object.keys(cleanedRows[0]);

        const csvContent = [
            headers.join(","), // headers
            ...cleanedRows.map(row =>
                headers.map(key => {
                    let value = row[key];
                    if (typeof value === 'string') {
                        value = value.replace(/"/g, '""');
                        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                            value = `"${value}"`;
                        }
                    }
                    return value;
                }).join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Add event listener for the export button
    document.getElementById("exportBtn").addEventListener("click", () => {
        let searchTerm = document.getElementById("search").value.toLowerCase();
        let filteredEmployees = employees.filter(emp =>
            Object.values(emp).some(val =>
                val.toString().toLowerCase().includes(searchTerm)
            )
        );
        filteredEmployees = sortEmployees(filteredEmployees);
        exportToCSV("employees.csv", filteredEmployees);
    });


    // Export PDF
    document.getElementById("exportPdfBtn").addEventListener("click", function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let searchTerm = document.getElementById("search").value.toLowerCase();
            let filteredEmployees = employees.filter(emp =>
                Object.values(emp).some(val =>
                    val.toString().toLowerCase().includes(searchTerm)
                )
            );
            // filteredEmployees = sortEmployees(filteredEmployees);

        const tableHeaders = ["#", "Name", "Position", "Salary (Ksh)", "Email"];
    
        // const paginatedData = paginate(filteredEmployees);  // Use only paginated data
        const tableBody = filteredEmployees.map((emp, index) => [
            index + 1, 
            emp.fullName,
            emp.position,
            emp.salary,
            emp.email
        ]);

        doc.text("Employee Records (Page " + currentPage + ")", 14, 15);
        doc.autoTable({
            startY: 20,
            head: [tableHeaders],
            body: tableBody,
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [22, 160, 133] }
        });

        doc.save(`employee-page-${currentPage}.pdf`);
    });


    // Export Excel
    document.getElementById("exportExcelBtn").addEventListener("click", function () {
        let searchTerm = document.getElementById("search").value.toLowerCase();
        let filteredEmployees = employees.filter(emp =>
            Object.values(emp).some(val =>
                val.toString().toLowerCase().includes(searchTerm)
            )
        );

        filteredEmployees = sortEmployees(filteredEmployees);
        
        const data = [
            ["#", "Name", "Position", "Salary (Ksh)", "Email"]
        ];

        filteredEmployees.forEach((emp, index) => {
            data.push([
                index + 1,
                emp.fullName,
                emp.position,
                emp.salary,
                emp.email
            ]);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

        XLSX.writeFile(workbook, `employees.xlsx`);
    });








    // Import from CSV
    // This function will read a CSV file and add its contents to the employees array
    document.getElementById("importBtn").addEventListener("click", () => {
        document.getElementById("importFile").click();
    });

    let lastImportedEmployees = []; 

    document.getElementById("importFile").addEventListener("change", function () {
        const file = this.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            const rows = text.split('\n').map(row => row.trim()).filter(row => row);
            const headers = rows[0].split(',');

            const existingIds = new Set(employees.map(e => e.employeeId));
            let added = 0;
            const newEmployees = rows.slice(1).map(row => {
                const values = row.split(',');
                const emp = {};
                headers.forEach((header, index) => {
                    emp[header.trim()] = values[index] ? values[index].trim() : '';
                });
                emp.picture = emp.imageUrl || "";
                emp.salary = parseFloat(emp.salary) || 0;

                if (!existingIds.has(emp.employeeId)) {
                    added++;
                    return emp;
                }
                return null;
            }).filter(emp => emp);

            lastImportedEmployees = newEmployees;

            employees = [...employees, ...newEmployees];
            saveEmployees();
            displayEmployees();

            // Show import summary modal
            document.getElementById("importSummaryText").textContent =
                `${added} new employee(s) imported successfully.`;

            // Populate preview table
            const tbody = document.getElementById("importedEmployeesList");
            tbody.innerHTML = "";
            newEmployees.forEach(emp => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${emp.fullName}</td>
                    <td>${emp.position}</td>
                    <td>${emp.county}</td>
                `;
                tbody.appendChild(row);
            });

            document.getElementById("importModal").classList.remove("hidden");

            this.value = '';
        };


        reader.readAsText(file);
    });


    document.getElementById("closeImportModal").addEventListener("click", () => {
    document.getElementById("importModal").classList.add("hidden");
    });
    document.getElementById("closeSummaryBtn").addEventListener("click", () => {
        document.getElementById("importModal").classList.add("hidden");
    });

    // Optional: Close modal if clicking outside content
    window.addEventListener("click", (e) => {
        const modal = document.getElementById("importModal");
        if (e.target === modal) {
            modal.classList.add("hidden");
        }
    });


    document.getElementById("undoImportBtn").addEventListener("click", () => {
        if (lastImportedEmployees.length === 0) return;

        // Remove imported entries from employees array
        const idsToRemove = new Set(lastImportedEmployees.map(emp => emp.employeeId));
        employees = employees.filter(emp => !idsToRemove.has(emp.employeeId));

        saveEmployees();
        displayEmployees();

        // Clear the import modal and undo state
        document.getElementById("importModal").classList.add("hidden");
        lastImportedEmployees = [];
    });


});
