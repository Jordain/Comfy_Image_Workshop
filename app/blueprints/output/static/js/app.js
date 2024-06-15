// not needed I did it through flask and HTML for passing the fitlers through.
// function applyFilters() {
//     // Get selected values from dropdowns
//     var blueprint = document.getElementById('blueprintFilter').value;
//     var sort = document.getElementById('sortByFilter').value;
//     var limit = document.getElementById('limitFilter').value;

//     // Construct URL with selected filters
//     var url = `/output/filter?blueprint=${blueprint}&sort=${sort}&limit=${limit}`;

//     // Make a GET request to the Flask route
//     fetch(url)
//         .then(response => response.json())  // Assuming response is JSON
//         .then(data => {
//             // Assuming data contains the filtered generations
//             // Update HTML with the filtered data (not shown in this snippet)
//             console.log(data);  // Handle data as per your requirement
//         })
//         .catch(error => console.error('Error applying filters:', error));
// }