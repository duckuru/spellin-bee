import MainContent from "../components/content/MainContent";
// import ProfileComponent from '../components/navigations/ProfileComponent';

function MainPage() {
  return (
    <div className=" flex flex-col items-center justify-center overflow-hidden">
      <div className="w-full max-w-[90rem] flex justify-center items-center">
        <MainContent />
      </div>
    </div>
  );
}

export default MainPage;
