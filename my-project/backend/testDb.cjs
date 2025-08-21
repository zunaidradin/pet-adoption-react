const mysql = require('mysql2');

const testConnection = () => {
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pet_adoption'
  });

  connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
      return;
    }
    console.log('Successfully connected to MySQL!');
    
    // Test query
    connection.query('SELECT * FROM pets', (err, results) => {
      if (err) {
        console.error('Error querying pets:', err);
      } else {
        console.log('Pets found:', results);
      }
      connection.end();
    });
  });
};

testConnection();
