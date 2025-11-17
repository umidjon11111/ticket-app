import React from "react";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div>{children} </div>
    </div>
  );
};

export default layout;
