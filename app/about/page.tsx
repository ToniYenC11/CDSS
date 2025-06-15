export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Who are we?</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            The cerv.AI team is a dedicated team from the DOST-ASTI (Department of Science and Technology - Advanced
            Science and Technology Institute) committed to advancing healthcare through artificial intelligence and
            machine learning technologies. Our multidisciplinary team consists of researchers, data scientists, medical
            professionals, and software engineers working together to develop innovative solutions for early detection
            and diagnosis of cervical abnormalities.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">What is CDSS?</h2>
          <p className="text-lg leading-relaxed text-muted-foreground mb-4">
            A Clinical Decision Support System (CDSS) is a health information technology system designed to provide
            healthcare professionals with patient-specific assessments and evidence-based recommendations to aid in
            clinical decision-making. Our CDSS specifically focuses on cervical cancer screening and diagnosis using
            advanced AI algorithms.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            The system analyzes medical images and patient data to provide accurate, timely diagnostic support, helping
            healthcare providers make informed decisions about patient care. By leveraging machine learning and computer
            vision technologies, our CDSS aims to improve diagnostic accuracy, reduce human error, and enhance the
            overall quality of healthcare delivery.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Vision</h2>
          <p className="text-lg leading-relaxed text-muted-foreground mb-4">
            Our vision is to democratize access to high-quality healthcare diagnostics across the Philippines and
            beyond. We envision a future where advanced AI-powered diagnostic tools are accessible to healthcare
            providers in both urban and rural settings, bridging the gap in healthcare quality and availability.
          </p>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Through continuous research, development, and collaboration with medical institutions, we strive to create
            innovative solutions that save lives, reduce healthcare costs, and empower healthcare professionals with the
            tools they need to provide exceptional patient care. Our ultimate goal is to contribute to the elimination
            of preventable diseases through early detection and accurate diagnosis.
          </p>
        </section>

        <section className="bg-muted/50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">Our Commitment</h3>
          <p className="text-muted-foreground">
            We are committed to maintaining the highest standards of accuracy, privacy, and security in all our systems.
            Our work is guided by ethical principles and a deep respect for patient confidentiality and healthcare
            provider autonomy.
          </p>
        </section>
      </div>
    </div>
  )
}
