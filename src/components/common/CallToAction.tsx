"use client";

interface CallToActionProps {
  title: string;
  buttonText: string;
  buttonLink?: string;
}

export default function CallToAction({ title, buttonText, buttonLink = "#" }: CallToActionProps) {
  return (
    <div className="bg-gradient-to-r from-[#1160C9] from-0% to-[#08D2B8] p-8 md:p-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight text-center md:text-left m-0">
            {title}
          </h2>
          <a 
            href={buttonLink}
            className="flex h-[105px] min-w-0 cursor-pointer flex-col items-start justify-between rounded-[10px] bg-black p-4 text-[18px] md:text-[20px] outline-white hover:opacity-85 hover:outline-2 w-full md:w-auto sm:min-w-[300px]"
          >
            <span className="flex w-full justify-end">
              <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="1em" height="1em" viewBox="0 0 24 24" className="text-white">
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m13 6l6 6l-6 6M5 6l6 6l-6 6" />
              </svg>
            </span>
            <span className="text-white">{buttonText}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
