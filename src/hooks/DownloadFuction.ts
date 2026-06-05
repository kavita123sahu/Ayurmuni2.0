
export const getReceiptHtml = (
  receipt: any,
  specialization: string,
) => `

<!DOCTYPE html>
<html>

<head>

<style>

body{
  font-family: Arial;
  padding:25px;
  color:#1E293B;
}

.header{
  text-align:center;
  border-bottom:3px solid #0D614E;
  padding-bottom:15px;
}

.hospital{
  font-size:28px;
  font-weight:bold;
  color:#0D614E;
}

.receipt{
  color:#64748B;
  margin-top:5px;
}

.section{
  margin-top:20px;
}

.sectionTitle{
  background:#F1F5F9;
  padding:10px;
  font-weight:bold;
  color:#0D614E;
}

.row{
  margin-top:8px;
}

.label{
  color:#64748B;
  font-size:12px;
}

.value{
  font-size:14px;
  font-weight:bold;
}

table{
  width:100%;
  margin-top:15px;
  border-collapse:collapse;
}

th{
  background:#0D614E;
  color:#FFF;
  padding:10px;
}

td{
  padding:10px;
  border-bottom:1px solid #E2E8F0;
}

.total{
  margin-top:20px;
  text-align:right;
}

.totalAmount{
  color:#0D614E;
  font-size:28px;
  font-weight:bold;
}

.footer{
  margin-top:40px;
  text-align:center;
  font-size:11px;
  color:#94A3B8;
}

</style>

</head>

<body>

<div class="header">

<div class="hospital">
HealthConnect Clinic
</div>

<div class="receipt">
DIGITAL MEDICAL RECEIPT
</div>

</div>

<div class="section">

<div class="sectionTitle">
PATIENT INFORMATION
</div>

<div class="row">
<div class="label">Patient Name</div>
<div class="value">${receipt?.patient_name}</div>
</div>

</div>

<div class="section">

<div class="sectionTitle">
DOCTOR INFORMATION
</div>

<div class="row">
<div class="label">Doctor Name</div>
<div class="value">${receipt?.info?.doctor_name}</div>
</div>

<div class="row">
<div class="label">Specialization</div>
<div class="value">${specialization}</div>
</div>

</div>

<div class="section">

<div class="sectionTitle">
APPOINTMENT DETAILS
</div>

<div class="row">
<div class="label">Consultation Date</div>
<div class="value">${receipt?.slot?.date}</div>
</div>

<div class="row">
<div class="label">Time Slot</div>
<div class="value">${receipt?.slot?.slot_time}</div>
</div>

</div>

<table>

<tr>
<th>Description</th>
<th>Amount</th>
</tr>

<tr>
<td>Consultation Fee</td>
<td>$${receipt?.consultation_fees}</td>
</tr>

<tr>
<td>Administrative Charges</td>
<td>$${receipt?.administrative_charges}</td>
</tr>

<tr>
<td>Digital Report Access</td>
<td>$${receipt?.digital_report_access}</td>
</tr>

</table>

<div class="total">

<div>Total Paid</div>

<div class="totalAmount">
$${receipt?.total_amount}
</div>

</div>

<div class="footer">

This is a computer generated medical receipt.<br/>
No signature required.

</div>

</body>
</html>

`;