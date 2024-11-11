
let db;  // Global variable to hold the database instance

// Function to initialize the database
function initializeDatabase() {
  return initSqlJs().then((SQL) => {
    // Fetch and apply the schema
    return fetch("schema.sql")
      .then(response => response.text())
      .then(schema => {
        // Create a new database instance
        db = new SQL.Database();

        // Run the schema SQL commands
        db.run(schema);

        console.log('Database created and schema applied');

        // Run a test query to verify the table info


        // Return a promise that resolves after rendering is complete
        // return new Promise((resolve) => {
        //   renderStudSub();
        //   resolve();
        // });
      })
      .catch(err => console.error('Error initializing database:', err));
  });
}

function renderHeader() {
  const result = db.exec("SELECT name FROM sqlite_master WHERE type='table';");
  const root = document.getElementById("root");

  //constructing table structure for manupulation
  result[0].values.forEach((tablename, id) => {
    const tablediv = document.createElement("div");
    tablediv.innerHTML = `<h2>  ${tablename[0]}</h2>
    <div id="${tablename[0]}">
      <div id="${tablename[0]}_input">
        <div>
          <h3>${tablename[0]} Input Table</h3>
          <table border="1">
            <thead>
              <tr class="${tablename[0] + "_header"}">
              </tr>
            </thead>
            <tbody id="${tablename[0]}-data-output">
              <!-- Dynamic rows will be added here -->
            </tbody>
          </table>
          <div style="margin-top: 10px">
            <button name="${tablename[0]}" onclick="add(${tablename})">Add ${tablename}</button>
            <button name="${tablename[0]}" onclick="saveJson(event)" style="margin-left: 10px">
              Save JSON
            </button>
            <input name="${tablename[0]}" type="file" onchange="loadJson(event)" style="margin-left: 10px" />
            <button name="${tablename[0]}" onclick="generateOutput(event)" style="margin-left: 10px">
              Generate Output
            </button>
          </div>
        </div>
      </div>

      <div id="${tablename[0]}-output-section" class="hidden">
        <h3>${tablename[0]} Output Table</h3>
        <table border="1">
          <thead>
            <tr class = "${tablename[0]}_header">
            </tr>
          </thead>
          <tbody id="${tablename[0]}-output-table">
            <!-- Dynamic output rows will be added here -->
          </tbody>
        </table>
      </div>
    </div>`;
    root.appendChild(tablediv);

    //rendering header for a table.
    const tablerow = document.getElementsByClassName(`${tablename[0]}_header`);
    for (var i = 0; i < tablerow.length; i++) {
      tablerow[i].innerHTML = "";
      const res = db.exec(`PRAGMA table_info(${tablename[0]});`);
      res[0].values.forEach((data, index) => {
        if (index > 0) {
          const th = document.createElement("th");
          th.innerHTML = data[1];
          tablerow[i].appendChild(th);
          // console.log(data[1]);
        }
      });
    }

    const tableinfo = db.exec(`PRAGMA table_info(${tablename[0]})`);
    var query = `INSERT INTO ${tablename[0]} values("0"`;

    tableinfo[0].values.forEach((data, index) => {
      if (index > 0) {
        query = query + `, ""`;
      }
    });
    query = query + `);`;
    const qres = db.exec(query);
    renderTable(tablename[0]);
  });

}

function renderTable(tablename) {
  const output = document.getElementById(`${tablename}-data-output`);
  output.innerHTML = "";
  const res = db.exec(`SELECT * from ${tablename};`);
  if (res[0]) {
    res[0].values.forEach((data, rowindex) => {
      const row = document.createElement("tr");
      row.innerHTML = "";
      data.forEach((coldata, colId) => {
        if (colId > 0) {
          const tableColumn = document.createElement("td");
          tableColumn.innerHTML = `
          <div class="container">
              <input type="text" name="${res[0].columns[colId]}" value="${coldata}" oninput="handleInputChange(${data[0]}, event, ${tablename}, ${colId})" />
              <ul type = "none" id="${tablename}-${res[0].columns[colId]}-dropdown" class="dropdown">
                <!-- List items will be dynamically inserted here -->
              </ul>
          </div>
          `;
          row.appendChild(tableColumn);
        }
      });
      const tableColumn = document.createElement("td");
      tableColumn.innerHTML = `<button onclick="remove(${data[0]}, ${tablename})">Remove</button>`;
      row.appendChild(tableColumn);
      output.appendChild(row);
    });
  }
}

function add(tablename) {
  const res = db.exec(`PRAGMA table_info (${tablename.id});`);
  const tableinfo = db.exec(`SELECT * from ${tablename.id};`);
  const row = document.createElement("tr");
  var query = `INSERT INTO ${tablename.id} values(${tableinfo[0] ? (tableinfo[0].values.length) : 0}`;
  res[0].values.forEach((data, index) => {
    if (index > 0) {
      query = query + `, ""`;
    }
  });
  query = query + `);`;
  const qres = db.exec(query);
  renderTable(tablename.id);
}

function handleInputChange(index, event, tableName, colId) {

  const { name, value } = event.target;

  const result = db.exec(`PRAGMA foreign_key_list(${tableName.id});`);
  if (result[0]) {
    let tab = "";
    var relColumns = [];
    result[0].values.forEach((col, colId) => {
      if (col[3] == name) {
        tab = col[2];
      }
    });

    if (tab != "") {
      result[0].values.forEach((col, colId) => {
        if (col[2] == tab && col[3] != name) {
          relColumns.push(col[3]);
        }
      });
      var len = relColumns.length;
      var query1 = "";
      var result1;
      if (len > 0) {
        query1 = `select `;
        relColumns.forEach((data, id) => {
          if (id != len - 1) {
            query1 += `${data},`;
          } else {
            query1 += `${data} `;
          }
        });
        query1 += `from ${tableName.id} where id = ${index}`;
        result1 = db.exec(query1);
      }
      query1 = `SELECT distinct(${name}) from ${tab} where`;
      if (result1) {
        len = result1[0].columns.length;
        result1[0].values[0].forEach((data, id) => {
          if (data != "") {
            query1 += ` ${result1[0].columns[id]} = "${data}" AND`;
          }
        });
      }
      query1 += ` ${name} LIKE "%${value}%";`;
      result1 = db.exec(query1);
      console.log(result1);
      const dropdown = document.getElementById(`${tableName.id}-${name}-dropdown`);
      dropdown.style.display = "block";
      dropdown.innerHTML = "";
      if (result1) {
        result1[0].values.forEach((data, id) => {
          const li = document.createElement("li");
          li.innerHTML = data;
          li.id = data;
          li.addEventListener("click", (e) => {
            db.exec(
              `UPDATE ${tableName.id} set ${name} = "${e.target.id}" where id = ${index};`
            );
            renderTable(tableName.id);
            dropdown.style.display = "none";
          });
          dropdown.appendChild(li);
        });
      }
    }else{
      db.exec(
        `UPDATE ${tableName.id} set ${name} = "${value}" where id = ${index};`
      );
    }
  }else{
    db.exec(
      `UPDATE ${tableName.id} set ${name} = "${value}" where id = ${index};`
    );
  }
}

function generateOutput(event) {
  const tableName = event.target.name;
  const outputSection = document.getElementById(`${tableName}-output-section`);
  const outputTable = document.getElementById(`${tableName}-output-table`);
  const res = db.exec(`SELECT * FROM ${tableName};`);
  outputTable.innerHTML = "";
  if (res[0]) {
    res[0].values.forEach((data, index) => {
      console.log(data);
      const row = document.createElement("tr");
      data.forEach((colData, colId) => {
        if (colId) {
          const col = document.createElement("td");
          col.innerHTML = `<td><input type="text" value="${colData
            }" readonly /></td>`;
          row.appendChild(col);
        }
      });
      outputTable.appendChild(row);
    });
  }
  outputSection.classList.remove("hidden");
}

function remove(index, tableName) {
  const res = db.exec(`DELETE FROM ${tableName.id} where id = ${index}`);
  renderTable(tableName.id);
}

function getForeignKeys(db, tableName) {
  const result = db.exec(`PRAGMA foreign_key_list(${tableName});`);
  return result[0] ? result[0].values : [];
}

function saveJson(event) {
  const res = db.exec(`SELECT * FROM ${event.target.name};`);
  const jsonData = JSON.stringify(res);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.target.name}_data.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function loadJson(event) {
  const file = event.target.files[0];
  const reader = new FileReader();
  // db.exec(`DELETE from ${event.target.name};`);
  reader.onload = (e) => {
    res = JSON.parse(e.target.result);
    res[0].values.forEach((data) => {
      var query = `INSERT INTO ${event.target.name} VALUES (${data[0]}`;
      data.forEach((value, id) => {
        if (id > 0) {
          query += `, `;
          query += `"${value}"`;
        }
      });
      query += `);`;
      db.exec(query);
    });
    renderTable(event.target.name);
  };
  reader.readAsText(file);
}

// function initialUI(){
//   const root = document.getElementById("root");
//   root.innerHTML = "";
//   const fileInp = document.createElement("div");
//   dispatchEvent.innerHTML = `
//   <input name="schema-input" type="file" onchange="loadSchema(event)" style="margin-left: 10px" />
//   `;
//   root.appendChild(fileInp);
// }

// function loadSchema(event){
  
// }

//Initialize the database and render data
initializeDatabase().then(() => {
  renderHeader();
});




