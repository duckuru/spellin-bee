import MainContent from "../components/content/MainContent";
import ProfileComponent from '../components/navigations/ProfileComponent';

function MainPage() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden pt-12 ">
      {/* Top-right dropdown */}
      <div className="flex justify-end absolute z-60 right-20 top-[4.6rem] items-center gap-2">
        <ProfileComponent/>
      </div>

      {/* MainContent centered */}
      <div className="w-full min-h-screen flex items-center justify-center z-50">
        <MainContent />
      </div>
    </div>
  );
}

export default MainPage;
