import { Routes, Route } from "react-router-dom";
import BusinessCategoryGrid from "./components/BusinessCategoryGrid";
import CategorySection from "./components/CategorySection";
import Header2 from "./components/Headertwo";
import SearchBar from "./components/SearchBar";
import JobListings from "./components/JobListings";
import JobDetailPage from "./components/JobDetailPage";
import ChatPage from './components/ChatPage';
import Page from "./components/Pages";
import JobsList from "./components/JobsList";
import SignUp from "./components/SignUp";
import Login from "./components/Login";
import Psting from "./components/JobPostForm";
import CategoryJobs from './components/CategoryJobs';
import HomePage from './components/HomePage'; 
import Chat from './components/ChatPage2';
import Mypost from './components/MyJobPosts';
import SavedPosts from './components/SavedPosts';


function App() {
  return (
    <>
      <Routes>
       
        <Route path="/" element={<HomePage />} />
         <Route path="/my-posts" element={
          <>
          <Header2 />
          <Mypost />
          </>
          
          } />

        <Route path="/saved-posts" element={
          <>
          <Header2 />
          <SavedPosts 
          /> </>} />

       
        <Route 
          path="/jobs" 
          element={
            <>
              <Header2 />
              <JobListings />
            </>
          }
        />

            <Route 
          path="/chats" 
          element={
            <>
              <Header2 />
              <Chat />
            </>
          }
        />



        

        

        <Route path="/post-job" element={<Page />} />

        <Route
          path="/jobs/:id"
          element={
            <>
              <Header2 />
              <JobDetailPage />
            </>
          }
        />

        <Route
          path="/categories"
          element={
            <>
              <Header2 />
              <BusinessCategoryGrid />
            </>
          }
        />

        <Route path="/category/:category" element={<><Header2 /><CategoryJobs /></>} />

        <Route 
          path="/chat/:jobId" 
          element={
            <>
              <Header2 />
              <ChatPage />
            </>
          }
        />

        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/post-job-form" element={<Psting />} />
      </Routes>
    </>
  );
}

export default App;