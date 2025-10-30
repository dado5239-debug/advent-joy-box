import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Gift, ArrowLeft } from "lucide-react";

const allQuestions = [
  {
    question: "What is the most popular Christmas carol of all time?",
    options: ["Jingle Bells", "Silent Night", "White Christmas", "Deck the Halls"],
    correct: 1
  },
  {
    question: "In which country did the tradition of the Christmas tree originate?",
    options: ["USA", "Germany", "England", "France"],
    correct: 1
  },
  {
    question: "What are the traditional colors of Christmas?",
    options: ["Blue and Silver", "Red and Green", "Gold and White", "Purple and Pink"],
    correct: 1
  },
  {
    question: "How many reindeer pull Santa's sleigh (including Rudolph)?",
    options: ["8", "9", "10", "12"],
    correct: 1
  },
  {
    question: "What is traditionally hidden inside a Christmas pudding?",
    options: ["A ring", "A coin", "A button", "A thimble"],
    correct: 1
  },
  {
    question: "What year was 'Jingle Bells' written?",
    options: ["1857", "1900", "1920", "1945"],
    correct: 0
  },
  {
    question: "Which country started the tradition of putting up a Christmas tree?",
    options: ["Norway", "Germany", "Poland", "Austria"],
    correct: 1
  },
  {
    question: "What does Santa fill stockings with if children are naughty?",
    options: ["Nothing", "Coal", "Rocks", "Sticks"],
    correct: 1
  },
  {
    question: "What is Frosty the Snowman's nose made of?",
    options: ["A carrot", "A button", "A coal", "A stick"],
    correct: 1
  },
  {
    question: "How many ghosts visit Scrooge in 'A Christmas Carol'?",
    options: ["3", "4", "5", "2"],
    correct: 1
  },
  {
    question: "What Christmas decoration was originally made from silver?",
    options: ["Ornaments", "Tinsel", "Garland", "Stars"],
    correct: 1
  },
  {
    question: "What is the name of the Grinch's dog?",
    options: ["Max", "Buddy", "Rex", "Spot"],
    correct: 0
  },
  {
    question: "Which country does St. Nicholas come from?",
    options: ["Finland", "Turkey", "Greece", "Russia"],
    correct: 1
  },
  {
    question: "What do people traditionally put on top of a Christmas tree?",
    options: ["A star", "An angel", "A bow", "Both A and B"],
    correct: 3
  },
  {
    question: "In 'Home Alone', where are the McCallisters going on vacation?",
    options: ["London", "Paris", "Rome", "Madrid"],
    correct: 1
  }
];

const getRandomQuestions = () => {
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
};

const Quiz = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState(getRandomQuestions());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasEarnedMoneyToday, setHasEarnedMoneyToday] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        toast.error("Please sign in to take the quiz");
        navigate("/auth");
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (user) {
      checkDailyMoney();
    }
  }, [user]);

  const checkDailyMoney = () => {
    const today = new Date().toDateString();
    const lastMoneyDate = localStorage.getItem(`quiz-money-${user?.id}`);
    
    if (lastMoneyDate === today) {
      setHasEarnedMoneyToday(true);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) {
      toast.error("Please select an answer");
      return;
    }

    if (selectedAnswer === quizQuestions[currentQuestion].correct) {
      setScore(score + 1);
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      completeQuiz();
    }
  };

  const completeQuiz = async () => {
    const finalScore = selectedAnswer === quizQuestions[currentQuestion].correct ? score + 1 : score;
    const canEarnMoney = !hasEarnedMoneyToday && finalScore === 5;
    const moneyEarned = canEarnMoney ? 5 : 0;

    setQuizCompleted(true);
    setScore(finalScore);

    if (!user) return;

    // Update user currency only if perfect score and haven't earned today
    if (canEarnMoney) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("currency")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ currency: (profile.currency || 0) + moneyEarned })
          .eq("user_id", user.id);
      }

      // Mark money as earned for today
      const today = new Date().toDateString();
      localStorage.setItem(`quiz-money-${user.id}`, today);
      setHasEarnedMoneyToday(true);

      toast.success(`Perfect score! You earned ${moneyEarned} money! 🎄`);
    } else if (finalScore === 5 && hasEarnedMoneyToday) {
      toast.info(`Perfect score! But you've already earned money today. Come back tomorrow!`);
    } else {
      toast.info(`Quiz completed! You scored ${finalScore}/5. Get all correct to earn money!`);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizQuestions(getRandomQuestions());
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const finalScore = score;
    const earnedMoney = finalScore === 5 && !hasEarnedMoneyToday;

    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Quiz Completed! 🎉</CardTitle>
              <CardDescription>
                You got {finalScore} out of 5 questions correct!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Gift className="w-24 h-24 mx-auto text-primary mb-4 animate-float" />
              {earnedMoney ? (
                <>
                  <p className="text-2xl font-bold mb-2">Perfect Score! You earned 5 money! 💰</p>
                  <p className="text-muted-foreground mb-6">
                    Amazing job! Come back tomorrow to earn more money!
                  </p>
                </>
              ) : finalScore === 5 && hasEarnedMoneyToday ? (
                <>
                  <p className="text-2xl font-bold mb-2">Perfect Score! 🌟</p>
                  <p className="text-muted-foreground mb-6">
                    You already earned money today. Try again tomorrow to earn more!
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold mb-2">Score: {finalScore}/5</p>
                  <p className="text-muted-foreground mb-6">
                    {hasEarnedMoneyToday 
                      ? "You've already earned money today. Practice for tomorrow!" 
                      : "Get all 5 questions correct to earn 5 money!"}
                  </p>
                </>
              )}
              <div className="flex gap-3 justify-center">
                <Button onClick={handleRetakeQuiz} size="lg" variant="outline">
                  Try Again
                </Button>
                <Button onClick={() => navigate("/")} size="lg">
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Daily Christmas Quiz 🎄</CardTitle>
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">
                {quizQuestions[currentQuestion].question}
              </h3>

              <RadioGroup
                value={selectedAnswer?.toString()}
                onValueChange={(value) => handleAnswerSelect(parseInt(value))}
              >
                {quizQuestions[currentQuestion].options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="w-full"
              size="lg"
            >
              {currentQuestion < quizQuestions.length - 1 ? "Next Question" : "Complete Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
