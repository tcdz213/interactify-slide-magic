const sponsors = [
  {
    name: "Udemy",
    logo: "https://www.udemy.com/staticx/udemy/images/v7/favicon-32x32.png",
    url: "https://www.udemy.com/",
  },
  {
    name: "edX",
    logo: "https://www.edx.org/favicon.ico",
    url: "https://www.edx.org/",
  },
  {
    name: "Skillshare",
    logo: "https://www.skillshare.com/favicon.ico",
    url: "https://www.skillshare.com/",
  },

  {
    name: "FutureLearn",
    logo: "https://www.futurelearn.com/favicon.ico",
    url: "https://www.futurelearn.com/",
  },
  {
    name: "General Assembly",
    logo: "https://generalassemb.ly/favicon.ico",
    url: "https://generalassemb.ly/",
  },
  {
    name: "Codecademy",
    logo: "https://www.codecademy.com/favicon.ico",
    url: "https://www.codecademy.com/",
  },
  {
    name: "MIT OpenCourseWare",
    logo: "https://ocw.mit.edu/favicon.ico",
    url: "https://ocw.mit.edu/",
  },
  {
    name: "IBM Skills Academy",
    logo: "https://www.ibm.com/favicon.ico",
    url: "https://www.ibm.com/training/",
  },
  {
    name: "MasterClass",
    logo: "https://www.masterclass.com/favicon.ico",
    url: "https://www.masterclass.com/",
  },
  {
    name: "The Odin Project",
    logo: "https://www.theodinproject.com/favicon.ico",
    url: "https://www.theodinproject.com/",
  },
  {
    name: "CS50 by Harvard",
    logo: "https://cs50.harvard.edu/favicon.ico",
    url: "https://cs50.harvard.edu/",
  },
  {
    name: "Stanford Online",
    logo: "https://online.stanford.edu/sites/default/files/favicon.ico",
    url: "https://online.stanford.edu/",
  },
  {
    name: "MITx MicroMasters",
    logo: "https://micromasters.mit.edu/favicon.ico",
    url: "https://micromasters.mit.edu/",
  },
  {
    name: "OpenClassrooms",
    logo: "https://openclassrooms.com/favicon.ico",
    url: "https://openclassrooms.com/",
  },
  {
    name: "Springboard",
    logo: "https://www.springboard.com/favicon.ico",
    url: "https://www.springboard.com/",
  },
];

const Sponsors = () => {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-center justify-items-center">
          {sponsors.map((sponsor) => (
            <a
              key={sponsor.name}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center transition-transform transform hover:scale-105"
            >
              <div className="h-16 w-32 bg-gray-100 rounded-md mb-2 flex items-center justify-center p-2">
                <img
                  src={sponsor.logo}
                  alt={sponsor.name}
                  className="max-h-full max-w-full"
                  loading="lazy"
                />
              </div>
              <span className="text-sm font-medium text-center text-gray-700 truncate w-32">
                {sponsor.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sponsors;
