@@
   // Vecuronium 10 mg / 10 mL -> draw depends on reconstitution (editable)
-  { key: 'adult_vecuronium', group: 'adult', label: 'Vecuronium — draw X mL (editable conc) + NS→10 mL', finalVolumeMl: 10, mode: 'target',
+  { key: 'adult_vecuronium', group: 'adult', label: 'Vecuronium', finalVolumeMl: 10, mode: 'target',
     target: { drugKey: 'vecuronium', amount: 10, unit: 'mg' },
     note: 'Local reconstitution varies; edit the stock conc in the card.',
     doseConfig: { unitPerKg: 'mg', defaultPerKg: 0.08, rangePerKg: [0.08, 0.1], basis: 'AUTO' } },
