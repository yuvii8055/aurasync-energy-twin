import { db, saveDatabaseToFile } from '../db/store.js';

export function getAllBins(req, res) {
  try {
    const { buildingId, type } = req.query;
    let list = [...db.bins];

    if (buildingId) list = list.filter(b => b.buildingId === buildingId);
    if (type) list = list.filter(b => b.type === type);

    // Calculate collection optimization stats
    const overflowingCount = list.filter(b => b.fillPct >= 85).length;
    const avgFillPct = Math.round(list.reduce((acc, b) => acc + b.fillPct, 0) / (list.length || 1));

    res.json({
      success: true,
      count: list.length,
      overflowingCount,
      avgFillPct,
      data: list
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export function emptyBin(req, res) {
  try {
    const { id } = req.params;
    const bin = db.bins.find(b => b.id === id);
    if (!bin) {
      return res.status(404).json({ success: false, error: 'Bin not found' });
    }

    bin.fillPct = Math.floor(Math.random() * 8) + 2; // Resets to 2-10%
    bin.lastEmptied = new Date().toISOString();
    saveDatabaseToFile();

    res.json({ success: true, message: `Bin ${bin.id} cleared and weighed`, bin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
