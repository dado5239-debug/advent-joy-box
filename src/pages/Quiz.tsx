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

const quizQuestions = [
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
  }
];

const Quiz = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);

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
      checkDailyQuiz();
    }
  }, [user]);

  const checkDailyQuiz = () => {
    const today = new Date().toDateString();
    const lastQuizDate = localStorage.getItem(`quiz-completed-${user?.id}`);
    
    if (lastQuizDate === today) {
      setHasCompletedToday(true);
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
    const moneyEarned = finalScore * 5; // 5 money per correct answer

    setQuizCompleted(true);

    if (!user) return;

    // Update user currency
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

    // Mark quiz as completed for today
    const today = new Date().toDateString();
    localStorage.setItem(`quiz-completed-${user.id}`, today);
    setHasCompletedToday(true);

    toast.success(`Quiz completed! You earned ${moneyEarned} money! 🎄`);
  };

  if (hasCompletedToday && !quizCompleted) {
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
              <CardTitle>Daily Quiz Completed! ✅</CardTitle>
              <CardDescription>
                You've already completed today's quiz. Come back tomorrow for a new challenge!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Gift className="w-24 h-24 mx-auto text-primary mb-4 animate-float" />
              <p className="text-lg text-muted-foreground">
                Keep collecting money to become VIP! 🌟
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const finalScore = score;
    const moneyEarned = finalScore * 5;

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
                You got {finalScore} out of {quizQuestions.length} questions correct!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <Gift className="w-24 h-24 mx-auto text-primary mb-4 animate-float" />
              <p className="text-2xl font-bold mb-2">You earned {moneyEarned} money! 💰</p>
              <p className="text-muted-foreground mb-6">
                Come back tomorrow for a new daily quiz!
              </p>
              <Button onClick={() => navigate("/")} size="lg">
                Return to Home
              </Button>
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
