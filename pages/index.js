import Head from "next/head";
import { MongoClient } from "mongodb"; // this will not be part of the client side bundle as it's only used in getStaticProps()
// NextJS is smarter than you and does this...
import MeetupList from "../components/meetups/MeetupList";
import { Fragment } from "react";

const HomePage = (props) => {
  return (
    <Fragment>
      <Head>
        <title>React Meetups</title>
        <meta
          name="description"
          content="Browse a huge list of highly active React meetups!"
        />
      </Head>
      <MeetupList meetups={props.meetups} />
    </Fragment>
  );
};

/**
export const getServerSideProps = async (context) => {
  // this runs on the server always on the server after deployment aka on each request i guess
  // again this code will not reach the client side so it's safe to do backend stuff
  //
  // !!!! ONLY USE WHEN U GOT DATA THAT CHANGES LIKE MULTIPLE TIMES A SECOND
  // !!!! OR IF YOU NEED ACCESS TO THE REQUEST OBJECT FOR AUTH STUFF
  // !!!! OTHERWISE getStaticProps is the much much faster option

  const req = context.req;
  const res = context.res;

  return {
    props: {
      meetups: DUMMY_MEETUPS,
    },
  };
};
 **/

export const getStaticProps = async () => {
  // this runs only in the build process it never reaches the client side, so you can do backend stuff

  const client = await MongoClient.connect(
    "mongodb+srv://mugurkek:mugurkekpassword01@cluster0.criol.mongodb.net/meetups?retryWrites=true&w=majority"
  );
  const db = client.db();

  const meetupsCollection = db.collection("meetups");

  const meetups = await meetupsCollection.find().toArray();

  client.close();

  //you always have to return an object like this
  return {
    props: {
      meetups: meetups.map((meetup) => ({
        title: meetup.title,
        address: meetup.address,
        image: meetup.image,
        id: meetup._id.toString(),
      })),
    },
    revalidate: 1, // number of seconds before re-generation on the server, such that when the users update stuff in the database we update the pregenerated html
  };
};

export default HomePage;
