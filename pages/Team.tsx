import React from 'react';
import { Link } from 'react-router-dom';

const Team: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <Link to="/" className="text-sm text-gray-400 hover:text-black mb-8 inline-block">&larr; Kembali</Link>
      <h1 className="text-4xl font-extrabold tracking-tight mb-4">Editorial Team</h1>
      <p className="text-gray-400 mb-12">Tim di balik TelierNews yang berkomitmen menghadirkan berita akurat dan mendalam.</p>
      <div className="space-y-6">
        <div className="flex items-center space-x-4 border border-gray-100 rounded-2xl p-6">
          <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center font-bold text-xl">M</div>
          <div>
            <p className="font-bold text-lg">Muhamad Rivaldy</p>
            <p className="text-gray-400 text-sm">Founder & Editor in Chief</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
