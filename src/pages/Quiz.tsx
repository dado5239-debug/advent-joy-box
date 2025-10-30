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

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer_index: number;
}

const Quiz = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [hasEarnedMoneyToday, setHasEarnedMoneyToday] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        toast.error("Please sign in to take the quiz");
        navigate("/auth");
      } else {
        loadRandomQuestions();
      }
    });
  }, [navigate]);

  const loadRandomQuestions = async () => {
    try {
      setLoading(true);
      // Fetch all questions
      const { data: allQuestions, error } = await supabase
        .from("quiz_questions")
        .select("*");

      if (error) throw error;

      if (!allQuestions || allQuestions.length === 0) {
        toast.error("No questions available");
        return;
      }

      // Shuffle and take 5 random questions
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffled.slice(0, 5).map(q => ({
        id: q.id,
        question: q.question,
        options: q.options as string[],
        correct_answer_index: q.correct_answer_index
      }));

      setQuizQuestions(selectedQuestions);
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Failed to load quiz questions");
    } finally {
      setLoading(false);
    }
  };

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

    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);

    if (selectedAnswer === quizQuestions[currentQuestion].correct_answer_index) {
      setScore(score + 1);
    }

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      completeQuiz(newAnswers);
    }
  };

  const completeQuiz = async (answers: number[]) => {
    const finalScore = selectedAnswer === quizQuestions[currentQuestion].correct_answer_index ? score + 1 : score;
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
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizCompleted(false);
    setUserAnswers([]);
    loadRandomQuestions();
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

              {finalScore < 5 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold">Review Your Answers:</h3>
                  {quizQuestions.map((question, index) => {
                    const userAnswer = userAnswers[index];
                    const isCorrect = userAnswer === question.correct_answer_index;
                    
                    if (isCorrect) return null;

                    return (
                      <div key={question.id} className="p-4 rounded-lg bg-muted/50 border border-destructive/20">
                        <p className="font-medium mb-2">Question {index + 1}: {question.question}</p>
                        <p className="text-destructive mb-1">
                          ❌ Your answer: {question.options[userAnswer]}
                        </p>
                        <p className="text-green-600">
                          ✓ Correct answer: {question.options[question.correct_answer_index]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading || quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-lg">Loading quiz questions...</p>
          </CardContent>
        </Card>
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
