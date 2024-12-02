const express=require('express');
const doctor=express.Router();
const mysql=require('mysql');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const connection=mysql.createConnection({   
    host:'localhost',
    user:'root',
    password:'', 
    database:'hospital'
});
connection.connect((error)=>{
    if(error){ 
        console.error(" error database conntecting ");
        return;
    }
    console.log("connected"+connection.threadId);
});

// -------------------------------
doctor.get('/booking',(req,res)=>{
    
    if(!req.session.login){
        res.send('session not available')
    }

     const {user}=req.session.login.name
     connection.query('Select *from bookings Where DoctorName=?',[user],(err,results)=>{
        if(err){
            console.log('Error fetching')
        }
        else{
            res.send(results)
        }
     })
});
// -------------------------------------------------

doctor.delete ('/deletebooking/:id',(req,res)=>{
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
                downloadUrl: `/doctor/prescriptions/prescription${ids}.pdf`, // Dynamic URL
                printUrl: `/doctor/prescriptions/prescription${ids}.pdf`,
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
module.exports=doctor