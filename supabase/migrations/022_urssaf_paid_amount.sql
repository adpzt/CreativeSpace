-- Montant URSSAF réellement payé pour un mois. Le montant affiché est une
-- prédiction (CA × taux) ; au moment de déclarer, Adrien peut l'ajuster de
-- quelques euros pour coller au montant réellement prélevé. On stocke ici cette
-- valeur exacte (null = on retombe sur la prédiction).
alter table urssaf_declarations
  add column if not exists paid_amount numeric(10, 2);
