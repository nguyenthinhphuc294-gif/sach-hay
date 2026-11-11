<?php
$paths = [
    'truck'=>'<path d="M1 4h14v13H1zM15 8h4l4 4v5h-8"/><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/>',
    'return'=>'<path d="M3 12a9 9 0 1 1 2.5 6.2M3 12V5m0 7h7"/>',
    'shield'=>'<path d="M12 22s7-3 7-10V5l-7-3-7 3v7c0 7 7 10 7 10Z"/><path d="m9 12 2 2 4-4"/>',
    'card'=>'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    'book'=>'<path d="M12 7C9 5 5 4 2 5v14c3-1 7 0 10 2 3-2 7-3 10-2V5c-3-1-7 0-10 2Zm0 0v14"/>',
    'pin'=>'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    'mail'=>'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7L22 6"/>',
    'clock'=>'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'bolt'=>'<path d="m13 2-9 12h7l-1 8 10-12h-7z" fill="currentColor"/>',
];
?>
<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><?= $paths[$icon] ?? '' ?></svg>
