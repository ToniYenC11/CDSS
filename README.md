# CDSS

This is a documentation on the Clinical Diagnostic Screening System (CDSS) as part of the cerv.AI project under the Department of Science and Technology - Advanced Science and Technology Institute.

## Team
**Ms. Roxanne S. Aviñante** - Project Supervisor 

**Mr. Jeffrey A. Aborot** - Technical Supervisor


**Toni Yenisei Czar S. Castañares** - Artificial Intelligence Engineer

**Rafael D. Ronquillo** - Artificial Intelligence Engineer

**Ken B. Horlador** - Artificial Intelligence Engineer

# Table of Contents

1. [About cerv.AI](#about-cervai)
2. [About CDSS](#about-cdss)
3. [How the CDSS and ImageBank System Works](#how-the-cdss-and-imagebank-system-works)
4. [How the Predictions are Made](#how-the-predictions-are-made)
5. [Recommendations for Improvement](#recommendations-for-improvement)

---

## About cerv.AI

cerv.AI is a project under the Department of Science and Technology - Advanced Science and Technology Institute (DOST-ASTI). The aim of the project is to develop a screening system that will utilize deep learning models to increase cervical cancer detection in the Philippines, by up to **70%** of the female population.

### Cervical Cancer in the Philippines
Cervical cancer is the [fourth](https://www.who.int/news-room/fact-sheets/detail/cervical-cancer) most prominent cancer in female worldwide. Moreover, it is the [second](https://www.philhealth.gov.ph/news/2023/cervical_coverage.pdf) most prominent in the Philippines. In partnership with [cerviQ](https://endcervicalcancerph.com/), the DOST-ASTI developed the cerv.AI project to increase the inexpensive screening methods of cervical cancer, to reduce the cost for the more expensive screening methods, and to continuously increase the vaccination with the female population for the Human papillomavirus (HPV). 

### Goal of the project (2030)
- **90%** of girls fully vaccinated by HPV (There are only 23% vaccinated for the first dose, and 5% for the second dose).
- **70%** high-performance test and screening (less than 1% are currently screened nationwide)
- **90%** of positive cases receive treatment (Approximately 50-60% have received treatment from the screened cases)

---

## About CDSS

The Clinical Decision Support System was created to help the future training of the deep learning models used for the porject. Doctors can re-annotate images in the CDSS that are part of the datasets to improve the detection of models for unlabeled images. The images are cases of **Visual Insepction via Acetic Acid (VIA)**. This [study](https://pmc.ncbi.nlm.nih.gov/articles/PMC4478664/) from the National Library of Medicine provides a comprehensive explanation of the method. To recap:

1. The cervix is first pictured without pouring acetic acid.
2. Acetic acid is poured and a waiting time of two (2) minutes will be observed in order to identify acetowhite areas forming around the area.
3. The midwife will identify based from the acetowhite areas if the cervix is possibly positive for cancer or not.

The test is inexpensive versus cytologic methods such as the Pap Smear Test and liquid-based cytology. It also does not augment the color of the cervix unlike the Visual Inspection with Lugol's Iodine (VLI). Here's a sample image of the annotation for the Intel-MobileODT dataset:

![image](https://github.com/user-attachments/assets/1f788670-62ee-44e0-b63d-d8f1404735e7)

---

## How the CDSS and ImageBank System Works

The CDSS is integrated along with ImageBank. The two-part system aids in dataset processing for future training of improved models for detection. For more information about ImageBank, see this [link here](). In summary, ImageBank holds the database of all images and dataset of DOST-ASTI. The CDSS invokes a call to check for directories of images for specific cancer types, specifically for cervical cancer. CDSS will then load these images, where the annotation will be performed by the doctor. Finally, the system will return the annotations to ImageBank as ground truth.

---

## How the Predictions are Made

The initial predictions/annotations of the model are done through deep learning models for object detectiong. There are a total of six (6) models so far, all found within this [Github repo](github.com/ToniYenC11/cerv.AI). The best performing model, has achieved **65%** Average Precision for areas over 50%. The Github repo also contains explanations regarding the value along with other metrics and visualization of predictions.

---

## Recommendations for Improvement

_Write your content here for suggestions and future improvements._

