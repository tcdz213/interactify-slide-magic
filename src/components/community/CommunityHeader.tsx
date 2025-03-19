import { useAuth } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import { MessageCircle, Users } from "lucide-react";

const CommunityHeader = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-gradient-to-b from-background/80 to-background py-6 md:py-12 border-b border-border/40">
      <div className="container-custom flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Community Forum
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Connect with trainers and learners, share experiences, and get
              answers to your questions.
            </p>
          </div>

          {isAuthenticated && (
            <Button className="whitespace-nowrap">
              <MessageCircle className="h-4 w-4 mr-2" />
              Start a Discussion
            </Button>
          )}
        </div>

        <div className="flex gap-4 flex-wrap">
          <div className="bg-card/50 border border-border/60 p-3 rounded-lg flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-semibold">1.2k</div>
              <div className="text-xs text-muted-foreground">Discussions</div>
            </div>
          </div>

          <div className="bg-card/50 border border-border/60 p-3 rounded-lg flex items-center gap-3">
            <div className="bg-primary/10 rounded-full p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-semibold">3.5k</div>
              <div className="text-xs text-muted-foreground">Members</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityHeader;
