var express=require('express')
const reception=express.Router();
const mysql=require('mysql');

const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

reception.use(express.json());
reception.use(express.urlencoded({ extended: true }));
const connection=mysql.createConnection({   
    host:'localhost',
    user:'root',
    password:'', 
    database:'hospital'
});
connection.connect((error)=>{
    if(error){ 
        console.log("recep");
        
        console.error(" error database conntecting ");
        return;
    }
    console.log("connected"+connection.threadId);
});


reception.post('/booking', (req, res) => {
    const { name, phone, Doctor,Age,Place,gender } = req.body;
     
    connection.query('SELECT Phone FROM bookings Where Phone=?',[phone],(err,results)=>{
  
        
      if (results.length!==0){
        res.send('Your already Appointed')
        console.log(results.length!==0)
        console.log('Your already Appointed')
      
      }
      else{
    // console.log(results)
       connection.query('SELECT MAX(Token) as Token FROM bookings', (err, results) => {
        if (err) {
            console.error("Error retrieving max token:", err);
            return res.status(500).send('Internal Server Error');
        }
  
        let Token = 100; // Default token if no bookings exist
        if (results[0].Token) {
            Token = results[0].Token + 1; // Increment token if there are bookings
        }
  
        console.log(`Assigned Token: ${Token}`);
  
        connection.query(
            'INSERT INTO bookings (Name, Phone, DoctorName,Age,Place,gender, Token) VALUES (?,?,?,?,?,?,?)',
            [name, phone, Doctor,Age,Place,gender ,Token],
            (err, results) => {
                if (err) {
                    console.error("Booking failed:", err);
                    return res.status(500).send('Booking failed');
                }
  
                res.send(`Your booking is confirmed. Your token number is: ${Token}`);
            }
        );
    });
  }
  });
  });



  reception.delete ('/deletebooking/:id',(req,res)=>{
    console.log(req.params)
    const {id}=req.params;
     console.log(id)
    connection.query('DELETE FROM bookings WHERE id=?',[id],(err,results)=>{
      if(err){
        console.log('error fetching')
        res.send('error mysql')
      }
      else{
        if(results.length===0){
          res.send("booking not able to delete")
          
        }
        else{
          res.send("delete successfully")
        }
      }
  
    });
  });

  reception.get('/displaydoc',(req,res)=>{
    connection.query('select *from doctor',(err,results)=>{
        if(err){
            res.send("error displaying")
        }
        res.send(results);
    })
});

reception.get('/peric/:id', (req, res) => {
    const { id } = req.params;
    console.log(id);

    connection.query('SELECT * FROM bookings WHERE id = ?', [id], async (err, results) => {
        if (err) {
            console.error('Error with MySQL:', err);
            return res.status(500).send('Database error.');
        }

        if (results.length === 0) {
            console.warn('No booking found', results);
            return res.status(404).send('No booking found.');
        }

        const ids = results[0].id;
        const name = results[0].Name;
        const Age = results[0].Age;
        const place = results[0].Place;
        const doctors = results[0].DoctorName;
        const gender = results[0].gender;
        console.log(name, Age, place, gender, doctors);

        const fs = require('fs');
        const puppeteer = require('puppeteer');

        try {
            // Define the PDF path
            const pdfPath = `./report/prescription${ids}.pdf`;

            async function generatePrescription() {
                // Load HTML template
                let html = fs.readFileSync('template.html', 'utf8');

                // Replace placeholders with actual data
                const date = new Date().toLocaleDateString();

                html = html
                    .replace('{{patientName}}', name)
                    .replace('{{Age}}', Age)
                    .replace('{{date}}', date)
                    .replace('{{place}}', place)
                    .replace('{{gender}}', gender)
                    .replace('{{doctor}}', doctors)
                    .replace('{{doctors}}', doctors);

                // Generate PDF with Puppeteer
                const browser = await puppeteer.launch();
                const page = await browser.newPage();

                await page.setContent(html);
                await page.pdf({ path: pdfPath, format: 'A4' });

                await browser.close();
                console.log('Prescription PDF generated:', pdfPath);
                
                res.download(pdfPath, `prescription${ids}.pdf`, (err,results) => {
                  if (err) {
                      console.error('Error sending the file:', err);
                      res.status(500).send('Error generating the prescription.');
                  }
                  else{
                    res.send(results)
                  }
  
              });
            }

            // Generate the PDF
            await generatePrescription();

            // Send the PDF as a download
           
         
            const pdfUrl = `./report/prescription${ids}.pdf`;
                res.json({
                    message: 'Prescription generated successfully',
                    downloadUrl: pdfUrl,
                    printUrl: pdfUrl
                });
        } catch (error) {
            console.error('Error generating prescription:', error);
            res.status(500).send('Error generating the prescription.');
        }
    });
});

// -----------------------------------------------------------------------------------------------------------------------
reception.get('/peric2/:id', async (req, res) => {
  const { id } = req.params;
  console.log(id);

  connection.query('SELECT * FROM bookings WHERE id = ?', [id], async (err, results) => {
      if (err) {
          console.error('Error with MySQL:', err);
          return res.status(500).send('Database error.');
      }

      if (results.length === 0) {
          console.warn('No booking found', results);
          return res.status(404).send('No booking found.');
      }

      const { id: ids, Name: name, Age, Place: place, DoctorName: doctorName, gender } = results[0];
      console.log(name, Age, place, gender, doctorName);

      try {
          const pdfPath = path.join(__dirname, 'report',  `prescription${ids}.pdf`);

          // Generate PDF
          async function generatePrescription() {
              // Load HTML template
              let html = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');
              const absoluteLogoPath = path.join(__dirname, 'logo', 'logo.jpg');
              const encodedLogoPath = `file://${absoluteLogoPath.replace(/\\/g, '/')}`;

              // Replace placeholders with actual data
              const date = new Date().toLocaleDateString();

              html = html
                  .replace('{{patientName}}', name)
                  .replace('{{Age}}', Age)
                  .replace('{{date}}', date)
                  .replace('{{place}}', place)
                  .replace('{{gender}}', gender)
                  .replace('{{doctor}}', doctorName)
                  .replace('{{doctors}}', doctorName)
                  .replace('{{logo}}',encodedLogoPath)

              // Generate PDF with Puppeteer
              const browser = await puppeteer.launch();
              const page = await browser.newPage();

              await page.setContent(html);
              await page.pdf({ path: pdfPath, format: 'A4' });

              await browser.close();
              console.log('Prescription PDF generated:', pdfPath);
              console.log('Absolute logo path:', absoluteLogoPath);
              console.log('Absolute logo path:',encodedLogoPath );
          }

          // Generate the PDF
          await generatePrescription();

          // Send the response
          res.json({
              message: 'Prescription generated successfully',
              downloadUrl: `/reception/prescriptions/prescription${ids}.pdf`, // Dynamic URL
              printUrl: `/reception/prescriptions/prescription${ids}.pdf`,
          });
      } catch (error) {
          console.error('Error generating prescription:', error);
          res.status(500).send('Error generating the prescription.');
      }
  });
});

// Static file serving for the generated PDFs

reception.use('/prescriptions', express.static(path.join(__dirname, 'report')));
// ------------------------------------------------------

module.exports=reception

