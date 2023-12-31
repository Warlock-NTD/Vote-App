import React, { useEffect, useState } from "react";
import { Button, Checkbox } from "@mui/material";
import { TextField } from "@mui/material";
import {
  updatePollVote,
  createVote,
  fetchDetailPoll,
  fetchPollStatistic,
} from "../../services";
import { useParams } from "react-router-dom";
import useDataContext from "../../context/useDataContext";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import Cookies from "js-cookie"

function PollDetail() {
  const { id } = useParams();
  const { isLoading, setIsLoading } = useDataContext();
  const [voteData, setVoteData] = useState({
    vote_context: Number(id),
    vote_sequence: [],
  });
  const [checkExp, setCheckExp] = useState(false);
  const [vote_context, setVote_context] = useState();
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    const fetchPollData = async () => {
      try {
        const res = await fetchDetailPoll(id);

        if (res) {
          setVote_context(res.data.vote_context);
          setVoteData({ ...voteData, vote_sequence: res.data.vote_sequence });
        }
      } catch (error) {
        toast.error("Get poll detail failed!");
      }
    };
    fetchPollData();
  }, [isLoading, id]);

  useEffect(() => {
    if (vote_context && vote_context.date_expired) {
      const dateTime = dayjs(vote_context?.date_expired, "YYYY-MM-DD HH:mm:ss");
      const currentDate = dayjs();
      if (dateTime < currentDate) {
        setCheckExp(true);
        toast.error("This poll expired!");
      }
    }
  }, [vote_context]);

  const handleVoteChange = (index) => {
    let vote_seq_temp = [...voteData.vote_sequence];
    if (vote_seq_temp[index] === 1) {
      vote_seq_temp[index] = 0;
    } else {
      vote_seq_temp[index] = 1;
    }
    setVoteData({ ...voteData, vote_sequence: [...vote_seq_temp] });
  };

  const getStatistic = (id) => {
    
    const access_token = Cookies.get('access');
    fetch(`${process.env.REACT_APP_API_BASE_URL}/poll/statistic/1/${id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': access_token? `Bearer ${access_token}` : "",
          },
          }
      )
        .then(response => response.blob())
        .then(image => {
            // Create a local URL of that image
            const localUrl = URL.createObjectURL(image);
            setImageData(localUrl);
        });
    }

  const [imageData, setImageData] = useState('');

  useEffect(() => getStatistic(id), [isLoading]);

  const handleCreateOption = async () => {
    if (!newOption) {
      toast.error("Please input new vote option!");
    } else {
      try {
        const response = await updatePollVote(id, newOption);
        if (response.status === 200) {
          toast.success("Update vote option successfully!");
          setIsLoading(!isLoading);
          setVote_context({
            ...vote_context,
            options: [...vote_context.options, newOption],
          });
        }
      } catch (error) {
        toast.error("Create vote option error!");
      }
    }
  };

  const submitPoll = async () => {
    const countSelect = voteData?.vote_sequence.reduce(
      (acc, element) => acc + (element === 1 ? 1 : 0),
      0
    );
    if (!countSelect) {
      toast.error("Please choose option!");
    } else if (!vote_context.is_multiple_vote_context && countSelect > 1) {
      toast.error("You must choose just 1 option, please!");
      return;
    } else {
      try {
        const res = await createVote(voteData);
        if (res.status === 200) {
          toast.success("Vote successfully!");
          setIsLoading(!isLoading);
          getStatistic(id);
        }
      } catch (error) {
        toast.error("Vote failed!");
      }
    }
  };

  return (
    <div className="w-11/12 md:w-3/5 xl:w-1/2 mx-auto">
      <div className="border border-t-2 rounded-md p-2 lg:p-5">
        <div>
          <div className="mb-4">
            <h2 className="text-start text-base font-bold">
              {vote_context?.title}
            </h2>
          </div>
          {vote_context?.options.map((option, index) => (
            <div key={index} className="flex justify-start items-center">
              <Checkbox
                checked={voteData?.vote_sequence[index]}
                onChange={() => {
                  handleVoteChange(index);
                }}
              />
              <p>{option}</p>
            </div>
          ))}
          <div>
            {vote_context?.allow_create_extra_ops ? (
              <div>
                <div className="flex justify-start mb-4">
                  <h3 className="font-bold">Create a new option</h3>
                </div>
                <div className="flex items-center gap-5">
                  <TextField
                    fullWidth
                    size="small"
                    type="text"
                    onChange={(event) => {
                      setNewOption(event.target.value);
                    }}
                    placeholder="New Option"
                  />
                  <Button
                    onClick={handleCreateOption}
                    variant="contained"
                    color="primary"
                    disabled={checkExp}
                  >
                    Create
                  </Button>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>

          <div className="my-3 flex justify-start items-center">
            <Button
              variant="contained"
              onClick={() => submitPoll()}
              disabled={checkExp}
            >
              Submit
            </Button>
          </div>
        </div>
        <div>
          <h2 className="text-start">Your current vote</h2>
        </div>
        {id ? (
          <div>
            {" "}
            {imageData ? <img src={imageData} alt="statistic"/> : <p>Vote statistic is loading ...</p>}
            {" "}
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default PollDetail;
