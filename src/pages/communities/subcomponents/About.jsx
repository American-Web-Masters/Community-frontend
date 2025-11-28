import React from 'react';
import AboutUs from './AboutUs';
import Rules from './Rules';
import Tags from './Tags';

const About = ({ community }) => {
  return (
    <div className="space-y-6">
      <AboutUs community={community} />
      <Rules community={community} />
      <Tags community={community} />
    </div>
  );
};

export default About;