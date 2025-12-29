import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, CheckCircle, AlertCircle, User, Mail, Phone, Calendar, BookOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Admission = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    studentName: "",
    dateOfBirth: "",
    gender: "",
    applyingClass: "",
    previousSchool: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Application submitted successfully! Your registration number is: SDSJSS-2081-XXXX");
    setCurrentStep(4);
  };

  const steps = [
    { number: 1, title: "Student Info" },
    { number: 2, title: "Parent Info" },
    { number: 3, title: "Documents" },
  ];

  return (
    <>
      <Helmet>
        <title>Online Admission | Shree Durga Saraswati Janata Secondary School</title>
        <meta 
          name="description" 
          content="Apply for admission to Shree Durga Saraswati Janata Secondary School. Online admission form for academic year 2081/82." 
        />
      </Helmet>
      
      <MainLayout>
        {/* Page Header */}
        <section className="relative py-24 bg-primary overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
                Online Admission
              </h1>
              <p className="text-lg text-primary-foreground/80">
                Begin your educational journey with us. Apply for admission for the academic year 2081/82.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Admission Form Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              {/* Progress Steps */}
              {currentStep < 4 && (
                <motion.div
                  className="flex items-center justify-center mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                            currentStep >= step.number
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {currentStep > step.number ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            step.number
                          )}
                        </div>
                        <span className="text-sm mt-2 text-muted-foreground">{step.title}</span>
                      </div>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-20 md:w-32 h-1 mx-2 transition-all duration-300 ${
                            currentStep > step.number ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Form */}
              <motion.div
                className="bg-card p-8 rounded-2xl shadow-card border border-border/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                      Student Information
                    </h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Student's Full Name *
                        </label>
                        <Input
                          name="studentName"
                          value={formData.studentName}
                          onChange={handleChange}
                          placeholder="Enter full name"
                          required
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Date of Birth *
                        </label>
                        <Input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Gender *
                        </label>
                        <Select 
                          value={formData.gender} 
                          onValueChange={(value) => handleSelectChange("gender", value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <BookOpen className="w-4 h-4 inline mr-2" />
                          Applying for Class *
                        </label>
                        <Select 
                          value={formData.applyingClass} 
                          onValueChange={(value) => handleSelectChange("applyingClass", value)}
                        >
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {[...Array(10)].map((_, i) => (
                              <SelectItem key={i + 1} value={`${i + 1}`}>
                                Class {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Previous School (if any)
                      </label>
                      <Input
                        name="previousSchool"
                        value={formData.previousSchool}
                        onChange={handleChange}
                        placeholder="Name of previous school"
                        className="h-12"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                      Parent/Guardian Information
                    </h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Parent/Guardian Name *
                      </label>
                      <Input
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleChange}
                        placeholder="Enter parent/guardian name"
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Phone Number *
                        </label>
                        <Input
                          name="parentPhone"
                          value={formData.parentPhone}
                          onChange={handleChange}
                          placeholder="+977-XXX-XXXXXXX"
                          required
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email Address
                        </label>
                        <Input
                          type="email"
                          name="parentEmail"
                          value={formData.parentEmail}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Address *
                      </label>
                      <Input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Ward, Municipality, District"
                        required
                        className="h-12"
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                      Document Upload
                    </h2>
                    
                    <div className="space-y-4">
                      {[
                        "Birth Certificate",
                        "Previous School Transfer Certificate",
                        "Previous Year's Marksheet",
                        "Passport Size Photo",
                      ].map((doc) => (
                        <div
                          key={doc}
                          className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                        >
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-foreground font-medium">{doc}</p>
                          <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, JPG, PNG (Max 5MB)
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-accent/10 p-4 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Note:</p>
                        <p>Document upload is optional during initial application. You can submit physical documents during admission confirmation.</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="w-20 h-20 text-accent mx-auto mb-6" />
                    </motion.div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                      Application Submitted Successfully!
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Your application has been received. Your registration number is:
                    </p>
                    <div className="bg-primary/10 text-primary font-mono text-xl font-bold py-3 px-6 rounded-lg inline-block mb-6">
                      SDSJSS-2081-XXXX
                    </div>
                    <p className="text-sm text-muted-foreground mb-8">
                      Please save this number for future reference. You will receive a confirmation email shortly.
                    </p>
                    <Button variant="default" size="lg" onClick={() => setCurrentStep(1)}>
                      Submit Another Application
                    </Button>
                  </div>
                )}

                {/* Navigation Buttons */}
                {currentStep < 4 && (
                  <div className="flex justify-between mt-8 pt-6 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={handlePrevStep}
                      disabled={currentStep === 1}
                    >
                      Previous
                    </Button>
                    {currentStep < 3 ? (
                      <Button onClick={handleNextStep}>
                        Next Step
                      </Button>
                    ) : (
                      <Button onClick={handleSubmit}>
                        Submit Application
                      </Button>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </MainLayout>
    </>
  );
};

export default Admission;
