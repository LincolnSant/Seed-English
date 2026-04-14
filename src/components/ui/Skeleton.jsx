import '../../styles/Skeleton.css';

export function SkeletonBlock({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div
      className="skeleton-block"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

export function SkeletonStudentHome() {
  return (
    <div className="sk-student">
      {/* Topbar */}
      <div className="sk-topbar">
        <SkeletonBlock width={120} height={20} />
        <SkeletonBlock width={80} height={32} radius={100} />
      </div>

      <div className="sk-body">
        {/* Hero */}
        <div className="sk-hero">
          <div>
            <SkeletonBlock width={240} height={32} style={{ marginBottom: 10 }} />
            <SkeletonBlock width={300} height={16} />
          </div>
          <SkeletonBlock width={100} height={32} radius={100} />
        </div>

        {/* Stats */}
        <div className="sk-stats">
          {[1,2,3].map((i) => (
            <div key={i} className="sk-stat">
              <SkeletonBlock width={48} height={28} style={{ marginBottom: 6 }} />
              <SkeletonBlock width={72} height={12} />
            </div>
          ))}
        </div>

        {/* Cards */}
        <div style={{ marginTop: 32 }}>
          <SkeletonBlock width={120} height={16} style={{ marginBottom: 14 }} />
          {[1,2,3].map((i) => (
            <div key={i} className="sk-card">
              <SkeletonBlock width={40} height={40} radius={10} />
              <div style={{ flex: 1 }}>
                <SkeletonBlock width={80} height={11} style={{ marginBottom: 6 }} />
                <SkeletonBlock width={200} height={15} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonTeacherHome() {
  return (
    <div className="sk-teacher">
      {/* Header */}
      <SkeletonBlock width={180} height={32} style={{ marginBottom: 8 }} />
      <SkeletonBlock width={280} height={16} style={{ marginBottom: 36 }} />

      {/* Stats */}
      <div className="sk-teacher-stats">
        {[1,2,3].map((i) => (
          <div key={i} className="sk-teacher-stat">
            <SkeletonBlock width={36} height={36} radius={10} style={{ marginBottom: 12 }} />
            <SkeletonBlock width={48} height={28} style={{ marginBottom: 6 }} />
            <SkeletonBlock width={96} height={12} />
          </div>
        ))}
      </div>

      {/* Students list */}
      <SkeletonBlock width={140} height={20} style={{ marginBottom: 16, marginTop: 40 }} />
      {[1,2,3,4].map((i) => (
        <div key={i} className="sk-student-row">
          <SkeletonBlock width={40} height={40} radius={50} />
          <div style={{ flex: 1 }}>
            <SkeletonBlock width={140} height={14} style={{ marginBottom: 6 }} />
            <SkeletonBlock width={100} height={11} />
          </div>
          <SkeletonBlock width={70} height={24} radius={100} />
        </div>
      ))}
    </div>
  );
}