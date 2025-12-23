import { useState } from "react";
import { useCallData } from "@/hooks/useCallData";
import { CallRecord } from "@/types/call";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CallsTable } from "@/components/dashboard/CallsTable";
import { TranscriptModal } from "@/components/dashboard/TranscriptModal";
import { AudioPlayer } from "@/components/dashboard/AudioPlayer";
import { StatusChart } from "@/components/dashboard/StatusChart";
import { DurationChart } from "@/components/dashboard/DurationChart";
import {
  Phone,
  Clock,
  CheckCircle,
  Activity,
  Headphones,
  XCircle,
} from "lucide-react";
import {
  formatDuration,
  formatPercentage,
  formatNumber,
} from "@/lib/formatters";

const Index = () => {
  const { calls, stats, loading, error } = useCallData();
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  const handlePlayRecording = (call: CallRecord) => {
    setSelectedCall(call);
    setShowPlayer(true);
  };

  const handleViewTranscript = (call: CallRecord) => {
    setSelectedCall(call);
    setShowTranscript(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Activity className="h-5 w-5 animate-pulse" />
          <span>Loading call data…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-destructive">
          Unable to load call analytics
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/15">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">
                  Call Analytics
                </h1>
                <p className="text-sm text-muted-foreground">
                  Customer communication overview
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              {formatNumber(stats.totalCalls)} calls processed
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Calls"
            value={formatNumber(stats.totalCalls)}
            subtitle="Overall volume"
            icon={Phone}
            variant="primary"
          />
          <StatsCard
            title="Answered Rate"
            value={formatPercentage(stats.completionRate)}
            subtitle={`${stats.completedCalls} answered`}
            icon={CheckCircle}
            variant="success"
          />
          <StatsCard
            title="Average Duration"
            value={formatDuration(stats.averageDuration)}
            subtitle={`${formatDuration(stats.totalDuration)} total talk time`}
            icon={Clock}
          />
          <StatsCard
            title="Unsuccessful Calls"
            value={formatNumber(stats.failedCalls)}
            subtitle="Requires follow-up"
            icon={XCircle}
            variant="warning"
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusChart calls={calls} />
          <DurationChart calls={calls} />
        </section>

        {/* Call History */}
        <section>
          <h2 className="text-lg font-medium mb-4">
            Recent Calls
          </h2>
          <CallsTable
            calls={calls}
            onPlayRecording={handlePlayRecording}
            onViewTranscript={handleViewTranscript}
          />
        </section>
      </main>

      {/* Modals */}
      <TranscriptModal
        call={selectedCall}
        open={showTranscript}
        onClose={() => setShowTranscript(false)}
      />
      <AudioPlayer
        call={selectedCall}
        open={showPlayer}
        onClose={() => setShowPlayer(false)}
      />
    </div>
  );
};

export default Index;
