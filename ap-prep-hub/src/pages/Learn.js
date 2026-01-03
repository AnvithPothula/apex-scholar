import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Book, Brain, Target, TrendingUp, Award, Users, Clock, ChevronRight, FileText, Zap, CheckCircle, ArrowLeft, BookOpen } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui/UIComponents';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AP_SUBJECTS } from '../constants/subjects';
import achievementsService from '../services/achievementsService';

// Subject curriculum data
// Enhanced curriculum data with actual learning content
const CURRICULUM_DATA = {
  'AP Biology': {
    units: [
      {
        title: 'Unit 1: Chemistry of Life',
        topics: [
          {
            name: 'Structure of Water and Hydrogen Bonding',
            content: {
              overview: 'Water is essential for all life on Earth. Its unique molecular structure gives it properties that make it an ideal medium for biological processes.',
              keyPoints: [
                'Water is a polar molecule with partial positive and negative charges',
                'Hydrogen bonding between water molecules creates cohesion and adhesion',
                'Water has high specific heat capacity, helping organisms maintain temperature',
                'Water is an excellent solvent for ionic and polar substances',
                'Surface tension allows insects to walk on water',
                'Ice is less dense than liquid water due to hydrogen bonding'
              ],
              examples: [
                'Hydrogen bonds allow water to form droplets and create surface tension',
                'Ice floats because hydrogen bonding creates an open crystalline structure',
                'Sweat cooling relies on water\'s high heat of vaporization',
                'Water transport in plants relies on cohesion-tension theory'
              ]
            }
          },
          {
            name: 'Elements of Life (CHNOPS)',
            content: {
              overview: 'All living organisms are composed primarily of six elements: carbon, hydrogen, nitrogen, oxygen, phosphorus, and sulfur (CHNOPS).',
              keyPoints: [
                'Carbon forms the backbone of organic molecules due to its ability to form four covalent bonds',
                'Hydrogen and oxygen are major components of water and organic molecules',
                'Nitrogen is essential for amino acids and nucleic acids',
                'Phosphorus is crucial for ATP, DNA, and cell membranes',
                'Sulfur is found in some amino acids and contributes to protein structure',
                'These elements make up 96% of living matter'
              ],
              examples: [
                'Carbon chains form the basis of carbohydrates, lipids, proteins, and nucleic acids',
                'Nitrogen fixation converts atmospheric N₂ into ammonia for biological use',
                'Phosphate groups in ATP store and transfer energy',
                'Disulfide bonds in proteins create tertiary structure'
              ]
            }
          },
          {
            name: 'Introduction to Biological Macromolecules',
            content: {
              overview: 'Four major classes of macromolecules perform essential functions in living organisms: carbohydrates, lipids, proteins, and nucleic acids.',
              keyPoints: [
                'Monomers are building blocks that link to form polymers',
                'Dehydration synthesis joins monomers by removing water',
                'Hydrolysis breaks polymers by adding water',
                'Each macromolecule class has unique structure and function',
                'Functional groups determine chemical properties'
              ],
              examples: [
                'Glucose monomers form starch and cellulose polymers',
                'Amino acids link via peptide bonds to form proteins',
                'Nucleotides join to create DNA and RNA',
                'Fatty acids combine with glycerol to make lipids'
              ]
            }
          },
          {
            name: 'Properties of Carbon',
            content: {
              overview: 'Carbon\'s unique bonding properties make it the foundation of organic chemistry and biological molecules.',
              keyPoints: [
                'Carbon has four valence electrons allowing four covalent bonds',
                'Carbon can form single, double, or triple bonds',
                'Carbon atoms can bond to form chains, rings, and branched structures',
                'Isomers have same molecular formula but different structures',
                'Functional groups confer specific chemical properties'
              ],
              examples: [
                'Glucose and fructose are structural isomers',
                'Saturated vs unsaturated fatty acids differ in double bonds',
                'Benzene rings provide stability in aromatic compounds',
                'Methyl groups make molecules hydrophobic'
              ]
            }
          }
        ],
        examWeight: '8-11%'
      },
      {
        title: 'Unit 2: Cell Structure and Function',
        topics: [
          {
            name: 'Cell Types: Prokaryotic vs Eukaryotic',
            content: {
              overview: 'Cells are classified into two major types based on the organization of their genetic material and internal structures.',
              keyPoints: [
                'Prokaryotic cells lack a membrane-bound nucleus',
                'Eukaryotic cells have a membrane-bound nucleus and organelles',
                'Prokaryotes include bacteria and archaea',
                'Eukaryotes include plants, animals, fungi, and protists',
                'Cell size is limited by surface area to volume ratio'
              ],
              examples: [
                'E. coli bacteria are prokaryotes with DNA in nucleoid region',
                'Human cells are eukaryotes with DNA in nucleus',
                'Chloroplasts and mitochondria have prokaryotic characteristics',
                'Larger cells often have specialized transport systems'
              ]
            }
          },
          {
            name: 'Subcellular Components and Organization',
            content: {
              overview: 'Eukaryotic cells contain specialized organelles that perform specific functions necessary for cellular life.',
              keyPoints: [
                'Nucleus contains DNA and controls gene expression',
                'Mitochondria produce ATP through cellular respiration',
                'Ribosomes synthesize proteins from mRNA',
                'Endoplasmic reticulum transports materials throughout cell',
                'Golgi apparatus modifies and packages proteins',
                'Lysosomes digest cellular waste and worn-out organelles'
              ],
              examples: [
                'Nuclear pores control molecular traffic',
                'Rough ER has ribosomes for protein synthesis',
                'Smooth ER synthesizes lipids and metabolizes toxins',
                'Peroxisomes break down fatty acids and detoxify harmful substances'
              ]
            }
          },
          {
            name: 'Cell Size and Surface Area to Volume Ratio',
            content: {
              overview: 'Cell size is constrained by the need to efficiently exchange materials with the environment.',
              keyPoints: [
                'Surface area determines rate of material exchange',
                'Volume determines metabolic demand',
                'SA:V ratio decreases as cell size increases',
                'Small cells have more efficient material exchange',
                'Adaptations increase effective surface area'
              ],
              examples: [
                'Microvilli increase intestinal cell surface area',
                'Cristae fold mitochondrial inner membrane',
                'Root hairs extend plant cell surface for absorption',
                'Flattened shape of red blood cells maximizes SA:V ratio'
              ]
            }
          },
          {
            name: 'Plasma Membranes',
            content: {
              overview: 'The plasma membrane controls what enters and exits the cell while maintaining cellular integrity.',
              keyPoints: [
                'Phospholipid bilayer forms membrane backbone',
                'Membrane proteins perform various functions',
                'Cholesterol modulates membrane fluidity',
                'Selective permeability controls molecular passage',
                'Membrane composition varies with function'
              ],
              examples: [
                'Channel proteins allow specific ion passage',
                'Carrier proteins change shape during transport',
                'Recognition proteins identify cell types',
                'Membrane receptors bind signaling molecules'
              ]
            }
          },
          {
            name: 'Membrane Permeability',
            content: {
              overview: 'Different molecules cross membranes by various mechanisms depending on their properties.',
              keyPoints: [
                'Small nonpolar molecules pass freely through lipid bilayer',
                'Polar molecules require specific transport proteins',
                'Ions need channels or carriers to cross membranes',
                'Large molecules may require vesicle transport',
                'Membrane potential affects ion movement'
              ],
              examples: [
                'Oxygen and carbon dioxide diffuse freely',
                'Glucose requires specific transporter proteins',
                'Sodium-potassium pump maintains ion gradients',
                'Endocytosis brings large molecules into cells'
              ]
            }
          },
          {
            name: 'Membrane Transport',
            content: {
              overview: 'Cells use various transport mechanisms to move substances across membranes.',
              keyPoints: [
                'Passive transport moves substances down gradients',
                'Active transport requires energy to move against gradients',
                'Facilitated diffusion uses proteins but no energy',
                'Primary active transport directly uses ATP',
                'Secondary active transport uses existing gradients'
              ],
              examples: [
                'Oxygen diffuses from lungs to blood passively',
                'Sodium-potassium pump uses ATP directly',
                'Glucose symporter uses sodium gradient',
                'Aquaporins facilitate water movement'
              ]
            }
          },
          {
            name: 'Tonicity and Osmoregulation',
            content: {
              overview: 'Cells must regulate water balance to maintain proper function and prevent damage.',
              keyPoints: [
                'Tonicity describes relative solute concentrations',
                'Hypotonic solutions cause cells to swell',
                'Hypertonic solutions cause cells to shrink',
                'Isotonic solutions maintain cell volume',
                'Osmoregulation maintains water balance'
              ],
              examples: [
                'Plant cells become turgid in hypotonic solutions',
                'Red blood cells burst in distilled water',
                'Salt water causes cell dehydration',
                'Kidneys regulate blood osmolarity'
              ]
            }
          }
        ],
        examWeight: '10-13%'
      },
      {
        title: 'Unit 3: Cellular Energetics',
        topics: [
          {
            name: 'Enzyme Structure and Function',
            content: {
              overview: 'Enzymes are biological catalysts that lower activation energy and speed up biochemical reactions.',
              keyPoints: [
                'Enzymes lower activation energy without being consumed',
                'Active site shape determines substrate specificity',
                'Induced fit model explains enzyme-substrate interaction',
                'Cofactors and coenzymes assist enzyme function',
                'Competitive and noncompetitive inhibition regulate activity'
              ],
              examples: [
                'Catalase breaks down hydrogen peroxide to water and oxygen',
                'Amylase begins starch digestion in the mouth',
                'DNA polymerase adds nucleotides during replication',
                'Feedback inhibition prevents overproduction of products'
              ]
            }
          },
          {
            name: 'Environmental Impacts on Enzyme Function',
            content: {
              overview: 'Environmental factors significantly affect enzyme activity and cellular metabolism.',
              keyPoints: [
                'Temperature affects molecular motion and enzyme shape',
                'pH changes can denature enzymes or alter active sites',
                'Substrate concentration affects reaction rate',
                'Enzyme concentration limits maximum reaction rate',
                'Inhibitors can compete with substrate or change enzyme shape'
              ],
              examples: [
                'Body temperature optimizes human enzyme function',
                'Stomach pepsin works best at low pH',
                'High fever can denature essential enzymes',
                'Cyanide inhibits cellular respiration enzymes'
              ]
            }
          },
          {
            name: 'Cellular Energy and ATP',
            content: {
              overview: 'ATP serves as the universal energy currency in cells, storing and transferring energy for cellular processes.',
              keyPoints: [
                'ATP consists of adenine, ribose, and three phosphate groups',
                'Energy is released when ATP is hydrolyzed to ADP',
                'ATP-ADP cycle couples energy-releasing and energy-requiring reactions',
                'Phosphorylation transfers energy to other molecules',
                'ATP is continuously regenerated in cells'
              ],
              examples: [
                'Muscle contraction requires ATP hydrolysis',
                'Active transport pumps use ATP energy',
                'Biosynthesis reactions are powered by ATP',
                'Bioluminescence in fireflies uses ATP'
              ]
            }
          },
          {
            name: 'Photosynthesis Overview',
            content: {
              overview: 'Photosynthesis converts light energy into chemical energy, producing glucose and oxygen from carbon dioxide and water.',
              keyPoints: [
                'Light reactions occur in thylakoid membranes',
                'Calvin cycle occurs in chloroplast stroma',
                'Chlorophyll absorbs light energy',
                'NADPH and ATP provide energy for carbon fixation',
                'Oxygen is released as a byproduct'
              ],
              examples: [
                'Plants use sunlight to make glucose',
                'Algae perform photosynthesis in aquatic environments',
                'C4 and CAM plants adapt to hot, dry conditions',
                'Photosynthesis supports most food chains on Earth'
              ]
            }
          },
          {
            name: 'Light-Dependent Reactions',
            content: {
              overview: 'Light reactions capture solar energy and convert it to chemical energy in the form of ATP and NADPH.',
              keyPoints: [
                'Photosystem II splits water and releases oxygen',
                'Electron transport chain pumps protons across thylakoid membrane',
                'Photosystem I reduces NADP+ to NADPH',
                'ATP synthase produces ATP using proton gradient',
                'Cyclic electron flow produces additional ATP'
              ],
              examples: [
                'Chlorophyll a is the primary photosynthetic pigment',
                'Accessory pigments expand light absorption range',
                'Z-scheme shows electron flow between photosystems',
                'Chemiosmosis links electron transport to ATP synthesis'
              ]
            }
          },
          {
            name: 'Light-Independent Reactions (Calvin Cycle)',
            content: {
              overview: 'The Calvin cycle uses ATP and NADPH from light reactions to fix carbon dioxide into glucose.',
              keyPoints: [
                'RuBisCO enzyme catalyzes carbon dioxide fixation',
                'Three phases: carbon fixation, reduction, regeneration',
                'Three CO₂ molecules produce one G3P sugar',
                'Six turns of cycle needed for one glucose molecule',
                'Photorespiration reduces photosynthetic efficiency'
              ],
              examples: [
                'C3 plants use standard Calvin cycle',
                'C4 plants concentrate CO₂ to reduce photorespiration',
                'CAM plants open stomata at night to conserve water',
                'Tropical plants often use C4 photosynthesis'
              ]
            }
          },
          {
            name: 'Cellular Respiration Overview',
            content: {
              overview: 'Cellular respiration breaks down glucose to produce ATP, providing energy for cellular processes.',
              keyPoints: [
                'Glucose is oxidized to carbon dioxide and water',
                'Process occurs in three main stages',
                'Oxygen serves as final electron acceptor',
                'Maximum yield is about 32 ATP per glucose',
                'Both plants and animals perform cellular respiration'
              ],
              examples: [
                'Muscle cells respire glucose during exercise',
                'Brain cells constantly require glucose for ATP',
                'Heart muscle has high mitochondrial density',
                'Fermentation occurs when oxygen is unavailable'
              ]
            }
          },
          {
            name: 'Glycolysis',
            content: {
              overview: 'Glycolysis breaks down glucose into pyruvate in the cytoplasm, producing ATP and NADH.',
              keyPoints: [
                'Occurs in cytoplasm of all cells',
                'Glucose is split into two three-carbon molecules',
                'Net production of 2 ATP and 2 NADH',
                'Does not require oxygen (anaerobic)',
                'Pyruvate enters mitochondria for further oxidation'
              ],
              examples: [
                'Red blood cells rely entirely on glycolysis',
                'Cancer cells often depend heavily on glycolysis',
                'Muscle cells use glycolysis during intense exercise',
                'Yeast performs glycolysis during fermentation'
              ]
            }
          },
          {
            name: 'Krebs Cycle (Citric Acid Cycle)',
            content: {
              overview: 'The Krebs cycle completely oxidizes pyruvate to CO₂, generating NADH, FADH₂, and ATP.',
              keyPoints: [
                'Occurs in mitochondrial matrix',
                'Pyruvate is converted to acetyl-CoA before entering cycle',
                'Each turn produces 3 NADH, 1 FADH₂, and 1 ATP',
                'Two turns needed per glucose molecule',
                'CO₂ is released as waste product'
              ],
              examples: [
                'Heart muscle mitochondria have high Krebs cycle activity',
                'Vitamins serve as coenzymes in the cycle',
                'Intermediate molecules can be used for biosynthesis',
                'Regulation prevents overproduction of ATP'
              ]
            }
          },
          {
            name: 'Oxidative Phosphorylation',
            content: {
              overview: 'The electron transport chain and chemiosmosis produce most ATP during cellular respiration.',
              keyPoints: [
                'NADH and FADH₂ donate electrons to transport chain',
                'Electron transport pumps protons across inner membrane',
                'Oxygen serves as final electron acceptor',
                'Proton gradient drives ATP synthase',
                'Produces about 26-28 ATP per glucose'
              ],
              examples: [
                'Cyanide blocks electron transport by binding cytochrome oxidase',
                'Brown adipose tissue uncouples transport from ATP synthesis',
                'Athletic training increases mitochondrial density',
                'Aging may reduce electron transport efficiency'
              ]
            }
          },
          {
            name: 'Fermentation',
            content: {
              overview: 'Fermentation allows glycolysis to continue without oxygen by regenerating NAD+.',
              keyPoints: [
                'Occurs when oxygen is not available',
                'Regenerates NAD+ needed for glycolysis',
                'Produces much less ATP than aerobic respiration',
                'Different organisms use different fermentation pathways',
                'Produces various end products'
              ],
              examples: [
                'Lactic acid fermentation in muscle cells during intense exercise',
                'Alcoholic fermentation by yeast in bread and beer production',
                'Acetic acid fermentation produces vinegar',
                'Muscle fatigue results from lactic acid accumulation'
              ]
            }
          }
        ],
        examWeight: '12-16%'
      },
      {
        title: 'Unit 4: Cell Communication and Cell Cycle',
        topics: [
          {
            name: 'Cell Communication Overview',
            content: {
              overview: 'Cells communicate through chemical signals to coordinate activities and respond to environmental changes.',
              keyPoints: [
                'Signal transduction converts external signals to cellular responses',
                'Three stages: reception, transduction, response',
                'Signaling molecules include hormones, neurotransmitters, and growth factors',
                'Local and long-distance signaling coordinate multicellular activities',
                'Signal amplification multiplies weak signals'
              ],
              examples: [
                'Insulin signals cells to take up glucose',
                'Growth factors stimulate cell division',
                'Neurotransmitters enable nerve communication',
                'Quorum sensing allows bacterial coordination'
              ]
            }
          },
          {
            name: 'Signal Transduction Pathways',
            content: {
              overview: 'Signal transduction pathways convert chemical signals into cellular responses through molecular interactions.',
              keyPoints: [
                'Receptor proteins specifically bind signaling molecules',
                'Binding causes conformational changes in receptors',
                'Second messengers amplify signals inside cells',
                'Protein kinases transfer phosphate groups to activate proteins',
                'Phosphatases remove phosphate groups to deactivate proteins'
              ],
              examples: [
                'cAMP serves as second messenger in many pathways',
                'Calcium ions trigger muscle contraction',
                'G-protein coupled receptors activate adenylyl cyclase',
                'Tyrosine kinase receptors undergo dimerization when activated'
              ]
            }
          },
          {
            name: 'Changes in Signal Transduction Pathways',
            content: {
              overview: 'Alterations in signaling pathways can lead to diseases and evolutionary adaptations.',
              keyPoints: [
                'Mutations can disrupt normal signaling',
                'Cancer often involves defective growth control signals',
                'Diabetes results from insulin signaling problems',
                'Evolution can modify signaling pathways',
                'Drugs often target specific signaling components'
              ],
              examples: [
                'p53 protein normally prevents cancer by stopping cell division',
                'Type 1 diabetes involves loss of insulin production',
                'Type 2 diabetes involves insulin resistance',
                'Aspirin blocks prostaglandin synthesis'
              ]
            }
          },
          {
            name: 'Cell Cycle and Mitosis',
            content: {
              overview: 'The cell cycle is a highly regulated process that ensures accurate DNA replication and distribution.',
              keyPoints: [
                'Interphase includes G1, S, and G2 phases',
                'DNA replication occurs during S phase',
                'Mitosis distributes chromosomes equally to daughter cells',
                'Cytokinesis divides cytoplasm between daughter cells',
                'Checkpoints ensure proper progression'
              ],
              examples: [
                'Skin cells divide frequently to replace damaged cells',
                'Nerve cells rarely divide after development',
                'Cancer cells ignore normal cell cycle controls',
                'Colchicine stops mitosis by disrupting spindle fibers'
              ]
            }
          },
          {
            name: 'Regulation of Cell Cycle',
            content: {
              overview: 'Cell cycle progression is tightly controlled by checkpoints and regulatory proteins.',
              keyPoints: [
                'Cyclins and cyclin-dependent kinases control progression',
                'G1/S checkpoint checks for DNA damage',
                'G2/M checkpoint ensures DNA replication is complete',
                'Spindle checkpoint verifies chromosome attachment',
                'p53 protein can stop cell cycle or trigger apoptosis'
              ],
              examples: [
                'UV radiation can trigger G1/S checkpoint',
                'Chemotherapy drugs often target rapidly dividing cells',
                'Growth factors override G1/S checkpoint',
                'Chromosomal instability can lead to cancer'
              ]
            }
          }
        ],
        examWeight: '10-15%'
      },
      {
        title: 'Unit 5: Heredity',
        topics: [
          {
            name: 'Meiosis and Genetic Diversity',
            content: {
              overview: 'Meiosis produces genetically diverse gametes through chromosome segregation and recombination.',
              keyPoints: [
                'Meiosis reduces chromosome number from diploid to haploid',
                'Crossing over creates new allele combinations',
                'Independent assortment increases genetic variation',
                'Two divisions produce four genetically unique gametes',
                'Errors in meiosis can cause genetic disorders'
              ],
              examples: [
                'Human egg and sperm cells have 23 chromosomes each',
                'Crossing over occurs during prophase I',
                'Down syndrome results from nondisjunction of chromosome 21',
                'Sexual reproduction increases genetic diversity'
              ]
            }
          },
          {
            name: 'Mendelian Genetics',
            content: {
              overview: 'Mendel\'s laws describe how traits are inherited from parents to offspring.',
              keyPoints: [
                'Law of segregation: alleles separate during gamete formation',
                'Law of independent assortment: genes assort independently',
                'Dominant alleles mask recessive alleles in heterozygotes',
                'Punnett squares predict offspring ratios',
                'Test crosses reveal unknown genotypes'
              ],
              examples: [
                'Brown eyes (B) are dominant over blue eyes (b)',
                'Cystic fibrosis is inherited as a recessive trait',
                'ABO blood types show codominance',
                'Sickle cell trait provides malaria resistance'
              ]
            }
          },
          {
            name: 'Non-Mendelian Inheritance',
            content: {
              overview: 'Many inheritance patterns do not follow simple Mendelian ratios.',
              keyPoints: [
                'Incomplete dominance produces intermediate phenotypes',
                'Codominance expresses both alleles simultaneously',
                'Multiple alleles create more than two variants',
                'Polygenic traits are controlled by multiple genes',
                'Environmental factors can influence gene expression'
              ],
              examples: [
                'Pink flowers from red and white parent flowers',
                'ABO blood system has three alleles (A, B, O)',
                'Human height is controlled by many genes',
                'Sun exposure affects skin pigmentation'
              ]
            }
          },
          {
            name: 'Environmental Effects on Phenotype',
            content: {
              overview: 'Environmental factors can significantly influence how genes are expressed.',
              keyPoints: [
                'Phenotype results from genotype-environment interaction',
                'Temperature can affect enzyme activity and development',
                'Nutrition influences growth and development',
                'Light exposure affects plant growth and animal behavior',
                'Epigenetic modifications can be environmentally induced'
              ],
              examples: [
                'Himalayan rabbit fur color depends on temperature',
                'Hydrangea flower color varies with soil pH',
                'Phenylketonuria symptoms prevented by dietary restriction',
                'Seasonal changes in arctic fox coat color'
              ]
            }
          }
        ],
        examWeight: '8-11%'
      },
      {
        title: 'Unit 6: Gene Expression and Regulation',
        topics: [
          {
            name: 'DNA and RNA Structure and Function',
            content: {
              overview: 'DNA stores genetic information while RNA plays multiple roles in gene expression.',
              keyPoints: [
                'DNA has double helix structure with complementary base pairing',
                'RNA is single-stranded with uracil instead of thymine',
                'DNA stores information; RNA participates in protein synthesis',
                'Nucleotides are building blocks of nucleic acids',
                'Hydrogen bonds hold complementary strands together'
              ],
              examples: [
                'A pairs with T in DNA, A pairs with U in RNA',
                'mRNA carries genetic code from nucleus to ribosomes',
                'tRNA brings amino acids to ribosomes during translation',
                'rRNA is structural component of ribosomes'
              ]
            }
          },
          {
            name: 'Replication',
            content: {
              overview: 'DNA replication ensures accurate copying of genetic information before cell division.',
              keyPoints: [
                'Semiconservative replication preserves one original strand',
                'DNA helicase unwinds double helix',
                'DNA polymerase adds nucleotides in 5\' to 3\' direction',
                'Leading strand is continuous; lagging strand is discontinuous',
                'Proofreading reduces replication errors'
              ],
              examples: [
                'Replication fork moves along DNA during synthesis',
                'Okazaki fragments form on lagging strand',
                'Telomerase extends chromosome ends in some cells',
                'DNA repair mechanisms fix replication errors'
              ]
            }
          },
          {
            name: 'Transcription',
            content: {
              overview: 'Transcription copies DNA information into RNA molecules.',
              keyPoints: [
                'RNA polymerase synthesizes RNA from DNA template',
                'Promoter sequences signal start of transcription',
                'Transcription factors help initiate transcription',
                'RNA processing modifies primary transcript in eukaryotes',
                'Alternative splicing creates protein variants'
              ],
              examples: [
                'TATA box is common promoter element',
                '5\' cap and poly-A tail stabilize mRNA',
                'Introns are removed; exons are joined',
                'Different cell types express different genes'
              ]
            }
          },
          {
            name: 'Translation',
            content: {
              overview: 'Translation converts mRNA sequences into protein sequences using the genetic code.',
              keyPoints: [
                'Ribosomes coordinate protein synthesis',
                'tRNA molecules carry specific amino acids',
                'Genetic code consists of three-nucleotide codons',
                'Start codon (AUG) begins translation',
                'Stop codons terminate protein synthesis'
              ],
              examples: [
                'Each tRNA has anticodon complementary to mRNA codon',
                'Peptide bonds form between amino acids',
                'Polyribosomes allow multiple proteins from one mRNA',
                'Post-translational modifications alter protein function'
              ]
            }
          },
          {
            name: 'Gene Regulation',
            content: {
              overview: 'Gene expression is regulated at multiple levels to control protein production.',
              keyPoints: [
                'Transcriptional control regulates mRNA production',
                'Post-transcriptional control modifies mRNA',
                'Translational control affects protein synthesis',
                'Post-translational control modifies protein function',
                'Negative feedback prevents overproduction'
              ],
              examples: [
                'lac operon responds to lactose presence in bacteria',
                'Hormones can activate or repress gene transcription',
                'microRNAs can block mRNA translation',
                'Phosphorylation can activate or deactivate proteins'
              ]
            }
          },
          {
            name: 'Gene Expression and Cell Specialization',
            content: {
              overview: 'Differential gene expression allows cells to specialize for different functions.',
              keyPoints: [
                'All cells in organism have same DNA',
                'Different genes expressed in different cell types',
                'Transcription factors control which genes are active',
                'Cell fate determined during development',
                'Stem cells can differentiate into multiple cell types'
              ],
              examples: [
                'Muscle cells express actin and myosin genes',
                'Nerve cells express neurotransmitter synthesis genes',
                'Embryonic stem cells are totipotent',
                'Cancer can result from loss of normal cell identity'
              ]
            }
          },
          {
            name: 'Mutations',
            content: {
              overview: 'Mutations are changes in DNA sequence that can affect gene function and organism phenotype.',
              keyPoints: [
                'Point mutations change single nucleotides',
                'Frameshift mutations add or delete nucleotides',
                'Silent mutations don\'t change amino acid sequence',
                'Missense mutations change amino acid sequence',
                'Nonsense mutations create premature stop codons'
              ],
              examples: [
                'Sickle cell anemia results from single nucleotide change',
                'Cystic fibrosis often caused by three-nucleotide deletion',
                'UV radiation can cause thymine dimers',
                'Some mutations provide adaptive advantages'
              ]
            }
          },
          {
            name: 'Biotechnology',
            content: {
              overview: 'Biotechnology uses biological processes and organisms to develop useful products and applications.',
              keyPoints: [
                'Recombinant DNA technology combines genes from different sources',
                'PCR amplifies specific DNA sequences',
                'Gel electrophoresis separates DNA fragments by size',
                'DNA sequencing determines nucleotide order',
                'Gene therapy attempts to treat genetic diseases'
              ],
              examples: [
                'Insulin produced by genetically modified bacteria',
                'Crime scene DNA analysis uses PCR',
                'GMO crops resistant to herbicides or pests',
                'CRISPR allows precise gene editing'
              ]
            }
          }
        ],
        examWeight: '12-16%'
      },
      {
        title: 'Unit 7: Natural Selection',
        topics: [
          {
            name: 'Introduction to Natural Selection',
            content: {
              overview: 'Natural selection is the mechanism by which organisms with favorable traits survive and reproduce more successfully.',
              keyPoints: [
                'Variation exists within populations',
                'Some variations are heritable',
                'Resources are limited leading to competition',
                'Individuals with advantageous traits survive and reproduce more',
                'Favorable alleles increase in frequency over time'
              ],
              examples: [
                'Darwin\'s finches developed different beak shapes for different foods',
                'Peppered moths changed color frequency during industrial revolution',
                'Antibiotic resistance evolves in bacterial populations',
                'Pesticide resistance develops in insect populations'
              ]
            }
          },
          {
            name: 'Evidence for Evolution',
            content: {
              overview: 'Multiple lines of evidence support the theory of evolution and common descent.',
              keyPoints: [
                'Fossil record shows progression of life forms over time',
                'Comparative anatomy reveals homologous structures',
                'Molecular evidence shows genetic similarities between related species',
                'Biogeography explains distribution patterns of species',
                'Direct observation of evolution in laboratory and nature'
              ],
              examples: [
                'Whale fossils show transition from land to water',
                'Vertebrate limbs have same bone structure',
                'DNA sequences more similar in closely related species',
                'Island species resemble mainland ancestors'
              ]
            }
          },
          {
            name: 'Common Ancestry and Phylogeny',
            content: {
              overview: 'All life shares common ancestry, and phylogenetic trees represent evolutionary relationships.',
              keyPoints: [
                'All organisms descended from common ancestor',
                'Phylogenetic trees show evolutionary relationships',
                'More recent common ancestors indicate closer relationships',
                'Molecular clocks estimate divergence times',
                'Convergent evolution produces similar traits in unrelated groups'
              ],
              examples: [
                'Humans and chimpanzees share recent common ancestor',
                'All mammals share common ancestor with reptiles',
                'Wings evolved independently in birds, bats, and insects',
                'rRNA sequences used to construct universal tree of life'
              ]
            }
          },
          {
            name: 'Population Genetics and Hardy-Weinberg',
            content: {
              overview: 'Population genetics describes how allele frequencies change in populations over time.',
              keyPoints: [
                'Hardy-Weinberg principle describes equilibrium conditions',
                'p² + 2pq + q² = 1 for two-allele system',
                'Evolution occurs when Hardy-Weinberg conditions are violated',
                'Factors causing evolution: selection, mutation, gene flow, drift',
                'Small populations more affected by genetic drift'
              ],
              examples: [
                'Cystic fibrosis allele frequency in human populations',
                'Founder effect in island populations',
                'Bottleneck effect reduces genetic diversity',
                'Gene flow between populations homogenizes allele frequencies'
              ]
            }
          },
          {
            name: 'Microevolution and Speciation',
            content: {
              overview: 'Microevolution leads to speciation when populations become reproductively isolated.',
              keyPoints: [
                'Reproductive isolation prevents gene flow between populations',
                'Geographic isolation can lead to allopatric speciation',
                'Sympatric speciation occurs without geographic isolation',
                'Prezygotic barriers prevent fertilization',
                'Postzygotic barriers reduce hybrid fitness'
              ],
              examples: [
                'Galápagos finches speciated on different islands',
                'Polyploidy causes instant speciation in plants',
                'Behavioral differences prevent mating between species',
                'Hybrid sterility seen in mules (horse-donkey crosses)'
              ]
            }
          },
          {
            name: 'Macroevolution and Extinction',
            content: {
              overview: 'Large-scale evolutionary changes occur over long time periods and include major transitions and extinctions.',
              keyPoints: [
                'Mass extinctions eliminate many species simultaneously',
                'Adaptive radiation follows extinction events',
                'Major evolutionary innovations open new niches',
                'Coevolution involves reciprocal evolutionary changes',
                'Human activities cause current extinction crisis'
              ],
              examples: [
                'Dinosaur extinction allowed mammal diversification',
                'Flowering plants and pollinators coevolved',
                'Evolution of photosynthesis changed Earth\'s atmosphere',
                'Current extinction rate exceeds background rate'
              ]
            }
          },
          {
            name: 'Origin of Life',
            content: {
              overview: 'Life likely arose from non-living matter through a series of chemical evolutionary steps.',
              keyPoints: [
                'Early Earth conditions different from today',
                'Organic molecules could form abiotically',
                'RNA World hypothesis suggests RNA came before DNA and proteins',
                'Protocells may have preceded true cells',
                'Metabolism may have evolved before genetics'
              ],
              examples: [
                'Miller-Urey experiment produced amino acids from simple gases',
                'Ribozymes are RNA molecules with catalytic activity',
                'Lipid vesicles can form spontaneously',
                'Hydrothermal vents provide energy for chemical reactions'
              ]
            }
          }
        ],
        examWeight: '13-20%'
      },
      {
        title: 'Unit 8: Ecology',
        topics: [
          {
            name: 'Responses to the Environment',
            content: {
              overview: 'Organisms have various behavioral and physiological responses to environmental stimuli.',
              keyPoints: [
                'Stimulus-response pathways coordinate behavior',
                'Innate behaviors are genetically programmed',
                'Learned behaviors are modified by experience',
                'Social behaviors benefit group survival',
                'Migration and hibernation are seasonal adaptations'
              ],
              examples: [
                'Moths navigate using moon for orientation',
                'Birds learn songs from parents and neighbors',
                'Honeybees communicate location of food sources',
                'Arctic animals migrate south in winter'
              ]
            }
          },
          {
            name: 'Energy Flow in Ecosystems',
            content: {
              overview: 'Energy flows through ecosystems in one direction from producers to consumers.',
              keyPoints: [
                'Primary producers capture energy from sun or chemicals',
                'Energy transfers between trophic levels are inefficient',
                'Only 10% of energy transfers to next trophic level',
                'Food webs show complex feeding relationships',
                'Decomposers recycle nutrients but not energy'
              ],
              examples: [
                'Plants convert solar energy to chemical energy',
                'Herbivores eat plants; carnivores eat herbivores',
                'Pyramid of energy shows decreasing energy at higher levels',
                'Bacteria decompose dead organisms'
              ]
            }
          },
          {
            name: 'Nutrient Cycling',
            content: {
              overview: 'Unlike energy, nutrients cycle through ecosystems and can be reused many times.',
              keyPoints: [
                'Carbon cycle involves photosynthesis and respiration',
                'Nitrogen cycle requires bacterial fixation and decomposition',
                'Phosphorus cycle has no atmospheric component',
                'Water cycle driven by solar energy',
                'Human activities alter natural nutrient cycles'
              ],
              examples: [
                'CO₂ levels in atmosphere vary seasonally',
                'Nitrogen-fixing bacteria live in legume root nodules',
                'Phosphorus often limits aquatic ecosystem productivity',
                'Acid rain results from sulfur and nitrogen emissions'
              ]
            }
          },
          {
            name: 'Population Dynamics',
            content: {
              overview: 'Population size changes due to births, deaths, immigration, and emigration.',
              keyPoints: [
                'Exponential growth occurs in ideal conditions',
                'Logistic growth includes environmental resistance',
                'Carrying capacity is maximum sustainable population size',
                'Density-dependent factors regulate population size',
                'Life history strategies affect population dynamics'
              ],
              examples: [
                'Bacterial populations grow exponentially in lab cultures',
                'Human population shows logistic growth pattern',
                'Predator populations lag behind prey populations',
                'r-selected species have many small offspring'
              ]
            }
          },
          {
            name: 'Community Interactions',
            content: {
              overview: 'Species interactions shape community structure and ecosystem function.',
              keyPoints: [
                'Competition occurs when resources are limited',
                'Predation involves one species eating another',
                'Mutualism benefits both species involved',
                'Commensalism benefits one species without harming other',
                'Parasitism benefits one species at expense of other'
              ],
              examples: [
                'Plants compete for sunlight and nutrients',
                'Wolves control deer populations through predation',
                'Flowers and pollinators benefit from mutualistic relationship',
                'Barnacles on whales gain transportation without harming whale'
              ]
            }
          },
          {
            name: 'Biodiversity and Human Impact',
            content: {
              overview: 'Biodiversity provides ecosystem services but is threatened by human activities.',
              keyPoints: [
                'Biodiversity includes genetic, species, and ecosystem diversity',
                'High diversity generally increases ecosystem stability',
                'Habitat destruction is major threat to biodiversity',
                'Climate change alters species distributions',
                'Conservation efforts attempt to preserve biodiversity'
              ],
              examples: [
                'Tropical rainforests have highest species diversity',
                'Keystone species have disproportionate ecosystem impact',
                'Deforestation reduces habitat for forest species',
                'Protected areas conserve threatened species'
              ]
            }
          },
          {
            name: 'Global Climate Change',
            content: {
              overview: 'Human activities are causing rapid climate change with widespread ecological effects.',
              keyPoints: [
                'Greenhouse gases trap heat in atmosphere',
                'Fossil fuel burning increases CO₂ levels',
                'Rising temperatures affect species distributions',
                'Ocean acidification threatens marine organisms',
                'Positive feedback loops accelerate climate change'
              ],
              examples: [
                'Arctic ice melting reduces reflectance of sunlight',
                'Coral bleaching increases with ocean warming',
                'Species migrate toward poles as climate warms',
                'Permafrost melting releases stored carbon'
              ]
            }
          }
        ],
        examWeight: '10-15%'
      }
    ]
  },
  'AP Chemistry': {
    units: [
      {
        title: 'Unit 1: Atomic Structure and Properties',
        topics: [
          {
            name: 'Moles and Molar Mass',
            content: {
              overview: 'The mole is a fundamental unit in chemistry that allows us to count atoms and molecules by weighing them.',
              keyPoints: [
                'One mole contains 6.022 × 10²³ particles (Avogadro\'s number)',
                'Molar mass is the mass of one mole of a substance in grams',
                'Molar mass of elements equals their atomic mass in g/mol',
                'Molar mass of compounds is the sum of atomic masses of all atoms'
              ],
              examples: [
                'One mole of carbon-12 has a mass of exactly 12 grams',
                'Water (H₂O) has a molar mass of 18.02 g/mol (2×1.01 + 16.00)',
                'Converting between grams and moles: moles = mass/molar mass'
              ]
            }
          },
          {
            name: 'Atomic Structure and Electron Configuration',
            content: {
              overview: 'Atoms consist of protons, neutrons, and electrons arranged in specific patterns that determine chemical properties.',
              keyPoints: [
                'Protons and neutrons are in the nucleus; electrons occupy orbitals',
                'Electron configuration follows the aufbau principle and Hund\'s rule',
                'Valence electrons determine chemical bonding behavior',
                'Periodic trends in atomic radius, ionization energy, and electronegativity'
              ],
              examples: [
                'Sodium (Na): 1s² 2s² 2p⁶ 3s¹ - one valence electron',
                'Chlorine (Cl): [Ne] 3s² 3p⁵ - seven valence electrons',
                'Noble gases have full valence shells, making them stable'
              ]
            }
          }
        ],
        examWeight: '7-9%'
      }
    ]
  },
  'AP Calculus AB': {
    units: [
      {
        title: 'Unit 1: Limits and Continuity',
        topics: ['Introducing Calculus: Can Change Occur at an Instant?', 'Defining Limits and Using Limit Notation', 'Estimating Limit Values from Graphs', 'Estimating Limit Values from Tables', 'Determining Limits Using Algebraic Properties of Limits', 'Determining Limits Using Algebraic Manipulation', 'Selecting Procedures for Determining Limits', 'Determining Limits Using the Squeeze Theorem', 'Exploring Types of Discontinuities', 'Defining Continuity at a Point', 'Confirming Continuity Over an Interval', 'Removing Discontinuities', 'Connecting Infinite Limits and Vertical Asymptotes', 'Connecting Limits at Infinity and Horizontal Asymptotes', 'Working with the Intermediate Value Theorem'],
        examWeight: '10-12%'
      },
      {
        title: 'Unit 2: Differentiation: Definition and Fundamental Properties',
        topics: ['Defining Average and Instantaneous Rates of Change at a Point', 'Defining the Derivative of a Function and Using Derivative Notation', 'Estimating Derivatives of a Function at a Point', 'Connecting Differentiability and Continuity', 'Applying the Power Rule', 'Derivative Rules: Constant, Sum, Difference, and Constant Multiple', 'Derivatives of cos x, sin x, eˣ, and ln x', 'The Product Rule', 'The Quotient Rule', 'Finding the Derivatives of Tangent, Cotangent, Secant, and/or Cosecant Functions'],
        examWeight: '10-12%'
      },
      {
        title: 'Unit 3: Differentiation: Composite, Implicit, and Inverse Functions',
        topics: ['The Chain Rule', 'Implicit Differentiation', 'Differentiating Inverse Functions', 'Differentiating Inverse Trigonometric Functions', 'Selecting Procedures for Calculating Derivatives', 'Calculating Higher-Order Derivatives'],
        examWeight: '9-13%'
      },
      {
        title: 'Unit 4: Contextual Applications of Differentiation',
        topics: ['Interpreting the Meaning of the Derivative in Context', 'Straight-Line Motion: Connecting Position, Velocity, and Acceleration', 'Rates of Change in Applied Contexts Other Than Motion', 'Introduction to Related Rates', 'Solving Related Rates Problems', 'Approximating Values of a Function Using Local Linear Approximation and Differentials', 'Using L\'Hôpital\'s Rule for Determining Limits of Indeterminate Forms'],
        examWeight: '10-15%'
      },
      {
        title: 'Unit 5: Analytical Applications of Differentiation',
        topics: ['Using the Mean Value Theorem', 'Extreme Value Theorem, Global Versus Local Extrema, and Critical Points', 'Determining Intervals on Which a Function Is Increasing or Decreasing', 'Using the First Derivative Test to Determine Relative (Local) Extrema', 'Using the Candidates Test to Determine Absolute (Global) Extrema', 'Determining the Concavity of Functions over Their Domains', 'Using the Second Derivative Test to Determine Extrema', 'Sketching Graphs of Functions and Their Derivatives', 'Connecting a Function, Its First Derivative, and Its Second Derivative', 'Introduction to Optimization Problems', 'Solving Optimization Problems', 'Exploring Behaviors of Implicit Relations'],
        examWeight: '15-18%'
      },
      {
        title: 'Unit 6: Integration and Accumulation of Change',
        topics: ['Exploring Accumulations of Change', 'Approximating Areas with Riemann Sums', 'Riemann Sums, Summation Notation, and Definite Integral Notation', 'The Fundamental Theorem of Calculus and Accumulation Functions', 'Interpreting the Behavior of Accumulation Functions Involving Area', 'Applying Properties of Definite Integrals', 'The Fundamental Theorem of Calculus and Definite Integrals', 'Finding Antiderivatives and Indefinite Integrals', 'Integrating Using Substitution', 'Integrating Functions Using Long Division and Completing the Square'],
        examWeight: '17-20%'
      },
      {
        title: 'Unit 7: Differential Equations',
        topics: ['Modeling Situations with Differential Equations', 'Verifying Solutions for Differential Equations', 'Sketching Slope Fields', 'Reasoning Using Slope Fields', 'Approximating Solutions Using Euler\'s Method', 'Finding General Solutions Using Separation of Variables', 'Finding Particular Solutions Using Initial Conditions and Separation of Variables', 'Exponential Models with Differential Equations'],
        examWeight: '6-12%'
      },
      {
        title: 'Unit 8: Applications of Integration',
        topics: ['Finding the Average Value of a Function on an Interval', 'Connecting Position, Velocity, and Acceleration Functions Using Integrals', 'Using Accumulation Functions and Definite Integrals in Applied Contexts', 'Finding Areas Between Curves Expressed as Functions of x', 'Finding Areas Between Curves Expressed as Functions of y', 'Finding the Area Between Curves That Intersect at More Than Two Points', 'Using Cross-Sections to Find the Volume of a Solid', 'Finding the Volume of a Solid of Revolution Using the Disc Method', 'Finding the Volume of a Solid of Revolution Using the Washer Method'],
        examWeight: '10-15%'
      }
    ]
  },
  'AP Physics 1': {
    units: [
      {
        title: 'Unit 1: Kinematics',
        topics: ['Position, Velocity, and Acceleration', 'Representations of Motion', 'Constant Acceleration', 'Projectile Motion', 'Relative Motion'],
        examWeight: '10-16%'
      },
      {
        title: 'Unit 2: Forces and Translational Dynamics',
        topics: ['Systems', 'The Gravitational Field', 'Contact Forces', 'Newton\'s First Law', 'Newton\'s Third Law and Free-Body Diagrams', 'Newton\'s Second Law', 'Applications of Newton\'s Second Law', 'Friction'],
        examWeight: '12-18%'
      },
      {
        title: 'Unit 3: Circular Motion and Gravitation',
        topics: ['Vector Fields', 'Fundamental Forces', 'Gravitational and Electric Forces', 'Gravitational Field/Acceleration Due to Gravity on Different Planets', 'Inertial vs. Gravitational Mass', 'Circular Motion Dynamics', 'Vertical Circular Motion', 'Free-Body Diagrams for Objects in Uniform Circular Motion'],
        examWeight: '6-14%'
      },
      {
        title: 'Unit 4: Energy',
        topics: ['Open and Closed Systems: Energy', 'Work and Mechanical Energy', 'Conservation of Energy, the Work-Energy Theorem, and Power', 'Introduction to Energy Diagrams', 'Conservation of Energy'],
        examWeight: '16-24%'
      },
      {
        title: 'Unit 5: Momentum',
        topics: ['Momentum and Impulse', 'Representations of Changes in Momentum', 'Open and Closed Systems: Momentum', 'Conservation of Momentum'],
        examWeight: '12-18%'
      },
      {
        title: 'Unit 6: Simple Harmonic Motion',
        topics: ['Period of Simple Harmonic Motion', 'Energy of a Simple Harmonic Oscillator', 'Comparing Simple Harmonic Motion and Circular Motion', 'Pendulums'],
        examWeight: '2-8%'
      },
      {
        title: 'Unit 7: Torque and Rotational Motion',
        topics: ['Rotational Kinematics', 'Torque and Angular Acceleration', 'Angular Momentum and Torque', 'Conservation of Angular Momentum'],
        examWeight: '10-16%'
      },
      {
        title: 'Unit 8: Electric Charge and Electric Force',
        topics: ['Electric Charge', 'Conservation of Electric Charge', 'Coulomb\'s Law', 'Electric Field', 'Electric Field Due to Point Charges', 'Field Lines'],
        examWeight: '4-10%'
      },
      {
        title: 'Unit 9: DC Circuits',
        topics: ['Electric Current', 'Resistance and Resistivity', 'Energy and Power', 'Resistors in Series', 'Resistors in Parallel', 'Steady-State Circuits with Capacitors'],
        examWeight: '6-14%'
      },
      {
        title: 'Unit 10: Mechanical Waves and Sound',
        topics: ['Introduction to Mechanical Waves', 'Wave Characteristics', 'Periodic Waves', 'Mathematical Representation of a Periodic Wave', 'Comparing Mechanical Waves', 'Sound Waves', 'Wave Interference and Superposition', 'Standing Waves and Resonance'],
        examWeight: '12-16%'
      }
    ]
  },
  'AP US History': {
    units: [
      {
        title: 'Unit 1: Period 1: 1491-1607',
        topics: ['Native American Societies Before European Contact', 'European Exploration in the Americas', 'Columbian Exchange, Spanish Exploration, and Conquest', 'Labor, Slavery, and Caste in the Spanish Colonial System', 'Cultural Interactions Between Europeans, Native Americans, and Africans'],
        examWeight: '4-6%'
      },
      {
        title: 'Unit 2: Period 2: 1607-1754',
        topics: ['Europeans Develop Colonial Strategies', 'The Chesapeake', 'The New England Colonies', 'The Middle Colonies', 'The Colonies in the British Empire', 'Slavery in the British Colonies', 'Colonial Society and Culture'],
        examWeight: '6-8%'
      },
      {
        title: 'Unit 3: Period 3: 1754-1800',
        topics: ['The Seven Years\' War', 'Taxation Without Representation', 'Philosophical Foundations of the American Revolution', 'The American Revolution', 'The Articles of Confederation', 'The Constitution', 'Shaping a New Republic'],
        examWeight: '10-17%'
      },
      {
        title: 'Unit 4: Period 4: 1800-1848',
        topics: ['The Rise of Political Parties and the Era of Jefferson', 'The Rise of American Democracy', 'Territorial Expansion and Manifest Destiny', 'Market Revolution: Society and Culture', 'Market Revolution: Industrialization', 'Expanding Democracy'],
        examWeight: '10-17%'
      },
      {
        title: 'Unit 5: Period 5: 1844-1877',
        topics: ['The Compromise of 1850', 'Sectional Conflict: Regional Differences', 'Sectional Conflict: Slavery and Politics', 'The Civil War', 'Reconstruction'],
        examWeight: '10-17%'
      },
      {
        title: 'Unit 6: Period 6: 1865-1898',
        topics: ['Westward Expansion: Economic Development', 'Westward Expansion: Social and Cultural Development', 'The Gilded Age: Politics and Technology', 'The Gilded Age: Labor, Immigration, and Urbanization', 'The Gilded Age: Cultural and Intellectual Life', 'The Rise of Industrial Capitalism'],
        examWeight: '10-17%'
      },
      {
        title: 'Unit 7: Period 7: 1890-1945',
        topics: ['Expanding the Role of Government', 'The Spanish-American War and World War I', 'Between the Wars', 'World War II: Mobilization', 'World War II: Military', 'Postwar Diplomacy'],
        examWeight: '10-17%'
      },
      {
        title: 'Unit 8: Period 8: 1945-1980',
        topics: ['The Cold War from 1945 to 1980', 'Postwar Confidence and Anxiety', 'The Korean War and Vietnam', 'Society in Transition', 'Protests, Activism, and Social Movements', 'The Environment and Natural Resources from 1968 to 1980'],
        examWeight: '10-17%'
      },
      {
        title: 'Unit 9: Period 9: 1980-Present',
        topics: ['Reagan and Conservatism', 'The End of the Cold War', 'Entering into the 21st Century'],
        examWeight: '4-6%'
      }
    ]
  },
  'AP English Language and Composition': {
    units: [
      {
        title: 'Unit 1: Claims and Evidence',
        topics: ['Introduction to Rhetoric', 'Rhetorical Situation', 'Claims and Evidence', 'Reasoning and Organization', 'Language and Style'],
        examWeight: '15-25%'
      },
      {
        title: 'Unit 2: Reasoning and Organization',
        topics: ['Introduction to Rhetorical Analysis', 'Rhetorical Appeals', 'Organizing an Argument', 'Methods of Development', 'Logical Fallacies'],
        examWeight: '15-25%'
      },
      {
        title: 'Unit 3: Language and Style',
        topics: ['Word Choice and Tone', 'Figurative Language', 'Comparison', 'Syntax and Grammar', 'Rhetorical Strategies'],
        examWeight: '15-25%'
      },
      {
        title: 'Unit 4: Perspective',
        topics: ['Bias and Perspective', 'Multiple Perspectives', 'Contextual Analysis', 'Historical Context', 'Contemporary Issues'],
        examWeight: '15-25%'
      },
      {
        title: 'Unit 5: Synthesis',
        topics: ['Research Skills', 'Source Integration', 'Documentation', 'Synthesis Writing', 'Academic Integrity'],
        examWeight: '15-25%'
      }
    ]
  },
  'AP Psychology': {
    units: [
      {
        title: 'Unit 1: Scientific Foundations of Psychology',
        topics: ['Introducing Psychology', 'Research Methods in Psychology', 'Analyzing Psychological Data', 'Ethical Guidelines in Psychology'],
        examWeight: '10-14%'
      },
      {
        title: 'Unit 2: Biological Bases of Behavior',
        topics: ['Interaction of Heredity and Environment', 'The Nervous System and Behavior', 'The Brain and Behavior', 'Sleep and Dreaming', 'Drugs and Consciousness'],
        examWeight: '8-10%'
      },
      {
        title: 'Unit 3: Sensation and Perception',
        topics: ['Principles of Sensation', 'Principles of Perception', 'Vision', 'Hearing', 'Other Senses', 'Perceptual Development and Plasticity'],
        examWeight: '6-8%'
      },
      {
        title: 'Unit 4: Learning',
        topics: ['Introduction to Learning', 'Classical Conditioning', 'Operant Conditioning', 'Cognitive and Biological Factors in Learning'],
        examWeight: '7-9%'
      },
      {
        title: 'Unit 5: Cognitive Psychology',
        topics: ['Introduction to Memory', 'Encoding and Storage', 'Retrieval', 'Forgetting and Memory Distortion', 'Intelligence', 'Problem Solving and Decision Making'],
        examWeight: '13-17%'
      },
      {
        title: 'Unit 6: Developmental Psychology',
        topics: ['Prenatal Development and the Newborn', 'Infancy and Childhood', 'Adolescence', 'Adulthood and Aging'],
        examWeight: '7-9%'
      },
      {
        title: 'Unit 7: Personality',
        topics: ['Introduction to Personality', 'Psychoanalytic Theories', 'Humanistic Theories', 'Trait Theories', 'Social Cognitive Theories', 'Biological Approaches', 'Personality Assessment'],
        examWeight: '7-9%'
      },
      {
        title: 'Unit 8: Abnormal Psychology',
        topics: ['Defining Abnormal Behavior', 'Understanding Psychological Disorders', 'Anxiety Disorders', 'Obsessive-Compulsive and Related Disorders', 'Depressive and Bipolar Disorders', 'Schizophrenia', 'Dissociative and Somatic Symptom Disorders'],
        examWeight: '7-9%'
      },
      {
        title: 'Unit 9: Treatment of Abnormal Psychology',
        topics: ['Introduction to Treatment', 'Psychological Approaches to Treatment', 'Biological Approaches to Treatment', 'Evaluating Treatment Effectiveness'],
        examWeight: '5-7%'
      }
    ]
  },
  'AP Environmental Science': {
    units: [
      {
        title: 'Unit 1: The Living World: Ecosystems',
        topics: ['Introduction to Ecosystems', 'Terrestrial Biomes', 'Aquatic Biomes', 'The Carbon Cycle', 'The Nitrogen Cycle', 'The Phosphorus Cycle', 'The Hydrologic (Water) Cycle', 'Primary Productivity', 'Trophic Levels', 'Energy Flow and the 10% Rule', 'Food Chains and Food Webs'],
        examWeight: '6-8%'
      },
      {
        title: 'Unit 2: The Living World: Biodiversity',
        topics: ['Introduction to Biodiversity', 'Ecosystem Services', 'Island Biogeography', 'Ecological Tolerance', 'Natural Disruptions to Ecosystems'],
        examWeight: '6-8%'
      },
      {
        title: 'Unit 3: Populations',
        topics: ['Generalist and Specialist Species', 'K-Selected and r-Selected Species', 'Survivorship Curves', 'Carrying Capacity', 'Population Growth and Resource Availability', 'Age Structure Diagrams', 'Total Fertility Rate', 'Human Population Dynamics', 'Demographic Transition'],
        examWeight: '10-15%'
      },
      {
        title: 'Unit 4: Earth Systems and Resources',
        topics: ['Plate Tectonics', 'Soil Formation and Erosion', 'Soil Composition and Properties', 'Earth\'s Atmosphere', 'Global Wind Patterns', 'Watersheds', 'Solar Radiation and Earth\'s Seasons', 'Earth\'s Geography and Climate'],
        examWeight: '10-15%'
      },
      {
        title: 'Unit 5: Land and Water Use',
        topics: ['The Tragedy of the Commons', 'Clearcutting', 'The Green Revolution', 'Impacts of Agricultural Practices', 'Irrigation Methods', 'Pest Control Methods', 'Meat Production Methods', 'Impacts of Overfishing', 'Impacts of Mining', 'Impacts of Urbanization'],
        examWeight: '10-15%'
      },
      {
        title: 'Unit 6: Energy Resources and Consumption',
        topics: ['Renewable and Nonrenewable Resources', 'Global Energy Consumption', 'Fuel Types and Uses', 'Distribution of Natural Energy Resources', 'Fossil Fuels', 'Nuclear Power', 'Energy from Biomass', 'Solar Energy', 'Hydroelectric Power', 'Geothermal Energy', 'Hydrogen Fuel Cells', 'Wind Energy', 'Energy Conservation'],
        examWeight: '10-15%'
      },
      {
        title: 'Unit 7: Atmospheric Pollution',
        topics: ['Introduction to Air Pollution', 'Photochemical Smog', 'Thermal Inversion', 'Atmospheric CO₂ and Particulates', 'Indoor Air Pollutants', 'Reduction of Air Pollutants', 'Acid Rain', 'Noise Pollution'],
        examWeight: '7-10%'
      },
      {
        title: 'Unit 8: Aquatic and Terrestrial Pollution',
        topics: ['Sources of Pollution', 'Human Impacts on Ecosystems', 'Endocrine Disruptors', 'Human Impacts on Wetlands and Mangroves', 'Eutrophication', 'Thermal Pollution', 'Persistent Organic Pollutants (POPs)', 'Bioaccumulation and Biomagnification', 'Solid Waste Disposal', 'Waste Reduction Methods', 'Sewage Treatment'],
        examWeight: '7-10%'
      },
      {
        title: 'Unit 9: Global Change',
        topics: ['Stratospheric Ozone Depletion', 'Reducing Ozone Depletion', 'The Greenhouse Effect', 'Increases in the Greenhouse Gases', 'Global Climate Change', 'Ocean Warming', 'Ocean Acidification', 'Invasive Species', 'Endangered Species', 'Human Impact on Biodiversity'],
        examWeight: '15-20%'
      }
    ]
  }
};

// Add more subjects as needed...
const EXCLUDED_SUBJECTS = [
  'AP Music Theory',
  'AP Research', 
  'AP Seminar',
  'AP Studio Art: 2-D Design',
  'AP Studio Art: 3-D Design', 
  'AP Studio Art: Drawing'
];

// Filtered subjects for practice tests
const LEARN_SUBJECTS = Object.fromEntries(
  Object.entries(AP_SUBJECTS).filter(([key]) => !EXCLUDED_SUBJECTS.includes(key))
);

// Subject categories for better organization
const SUBJECT_CATEGORIES = {
  'Math & Sciences': [
    'AP Biology', 'AP Chemistry', 'AP Physics 1: Algebra-Based', 'AP Physics 2: Algebra-Based',
    'AP Physics C: Mechanics', 'AP Physics C: Electricity and Magnetism', 'AP Environmental Science',
    'AP Calculus AB', 'AP Calculus BC', 'AP Statistics', 'AP Precalculus',
    'AP Computer Science A', 'AP Computer Science Principles'
  ],
  'History & Social Sciences': [
    'AP U.S. History', 'AP World History: Modern', 'AP European History',
    'AP U.S. Government and Politics', 'AP Government and Politics: Comparative',
    'AP Human Geography', 'AP Psychology', 'AP Macroeconomics', 'AP Microeconomics'
  ],
  'English & Literature': [
    'AP English Language and Composition', 'AP English Literature and Composition'
  ],
  'World Languages': [
    'AP Chinese Language and Culture', 'AP French Language and Culture',
    'AP German Language and Culture', 'AP Spanish Language and Culture',
    'AP Spanish Literature and Culture', 'AP Italian Language and Culture',
    'AP Japanese Language and Culture', 'AP Latin'
  ],
  'Arts & Other': [
    'AP Art History', 'AP African American Studies'
  ]
};

const Learn = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Debounce search input (update after 300ms of no typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Memoized filtered subjects - only recalculate when debounced search or category changes
  const filteredSubjects = useMemo(() => {
    let subjects = Object.entries(LEARN_SUBJECTS);

    // Filter by category
    if (selectedCategory !== 'All') {
      const categorySubjects = SUBJECT_CATEGORIES[selectedCategory] || [];
      subjects = subjects.filter(([key]) => categorySubjects.includes(key));
    }

    // Filter by search query (using debounced value)
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      subjects = subjects.filter(([key, subject]) =>
        key.toLowerCase().includes(searchLower) ||
        subject.name.toLowerCase().includes(searchLower) ||
        subject.description?.toLowerCase().includes(searchLower)
      );
    }

    return subjects;
  }, [debouncedSearch, selectedCategory]);

  const handleSubjectClick = async (subjectKey) => {
    // Track subject exploration achievement
    if (user?.uid) {
      try {
        await achievementsService.trackProgress(user.uid, 'subject_explorer', { subject: subjectKey });
      } catch (error) {
        console.error('Error tracking subject exploration:', error);
      }
    }

    if (CURRICULUM_DATA[subjectKey]) {
      setSelectedSubject(subjectKey);
      setSelectedUnit(null);
    } else {
      // Navigate to flashcards for subjects without curriculum
      navigate('/flashcards');
    }
  };

  const handleUnitClick = async (unit) => {
    // Track subject exploration achievement (when viewing curriculum units)
    if (user?.uid) {
      try {
        await achievementsService.trackProgress(user.uid, 'subject_explorer', { subject: selectedSubject });
      } catch (error) {
        console.error('Error tracking subject exploration:', error);
      }
    }

    setSelectedUnit(unit);
  };

  const handleTopicClick = (topic) => {
    setSelectedTopic(topic);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSelectedTopic(null);
  };

  const handleBackToUnits = () => {
    setSelectedUnit(null);
    setSelectedTopic(null);
  };

  const handleBackToTopics = () => {
    setSelectedTopic(null);
  };

  // Topic Detail View
  if (selectedTopic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="outline"
              onClick={handleBackToTopics}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Topics
            </Button>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              {typeof selectedTopic === 'string' ? selectedTopic : selectedTopic.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>{selectedSubject}</span>
              <span>•</span>
              <span>{selectedUnit.title}</span>
            </div>
          </motion.div>

          {/* Topic Content */}
          {selectedTopic.content && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Overview */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">Overview</h2>
                <p className="text-slate-300 leading-relaxed">{selectedTopic.content.overview}</p>
              </Card>

              {/* Key Points */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">Key Concepts</h2>
                <div className="space-y-3">
                  {selectedTopic.content.keyPoints.map((point, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{point}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Examples */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">Examples & Applications</h2>
                <div className="space-y-4">
                  {selectedTopic.content.examples.map((example, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-lg"
                    >
                      <p className="text-slate-300">{example}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Study Actions */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-slate-200 mb-4">Study This Topic</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => navigate('/flashcards')}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Zap className="w-4 h-4" />
                    Create Flashcards
                  </Button>
                  <Button 
                    onClick={() => navigate('/solver')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Target className="w-4 h-4" />
                    Practice Problems
                  </Button>
                  <Button 
                    onClick={() => navigate('/ai-tutors')}
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <BookOpen className="w-4 h-4" />
                    Ask AI Tutor
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Fallback for simple topic strings */}
          {!selectedTopic.content && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 text-center">
                <p className="text-slate-400 mb-6">
                  This topic is part of your curriculum. Use the study tools below to explore it further.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => navigate('/flashcards')}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <Zap className="w-4 h-4" />
                    Create Flashcards
                  </Button>
                  <Button 
                    onClick={() => navigate('/solver')}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Target className="w-4 h-4" />
                    Practice Problems
                  </Button>
                  <Button 
                    onClick={() => navigate('/ai-tutors')}
                    className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <BookOpen className="w-4 h-4" />
                    Ask AI Tutor
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Curriculum Detail View
  if (selectedUnit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="outline"
              onClick={handleBackToUnits}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Units
            </Button>
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              {selectedUnit.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>{selectedSubject}</span>
              <Badge variant="outline">{selectedUnit.examWeight}</Badge>
            </div>
          </motion.div>

          {/* Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-slate-200 mb-4">Topics Covered</h2>
              <div className="grid gap-3">
                {selectedUnit.topics.map((topic, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer group"
                    onClick={() => handleTopicClick(topic)}
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-slate-200 group-hover:text-blue-400 transition-colors">
                      {typeof topic === 'string' ? topic : topic.name}
                    </span>
                    {typeof topic === 'object' && topic.content && (
                      <Badge variant="outline" className="ml-auto text-xs bg-blue-500/20 text-blue-300">
                        Interactive
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Study Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-xl font-semibold text-slate-200 mb-4">Study This Unit</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => navigate('/flashcards')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200">Create Flashcards</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Generate AI flashcards for this unit
                </p>
              </Card>

              <Card className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => navigate('/flashcards')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200">Create Flashcards</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Generate AI flashcards for this unit
                </p>
              </Card>

              <Card className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => navigate('/solver')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200">Get Help</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Solve problems with AI assistance
                </p>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Subject Curriculum View
  if (selectedSubject) {
    const curriculum = CURRICULUM_DATA[selectedSubject];
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="outline"
              onClick={handleBackToSubjects}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subjects
            </Button>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-100">
                  {selectedSubject} Curriculum
                </h1>
                <p className="text-slate-400">
                  Complete curriculum breakdown with all units and topics
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => navigate('/flashcards')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200">Study Cards</h3>
                </div>
                <p className="text-sm text-slate-400">
                  AI-generated flashcards for this subject
                </p>
              </Card>

              <Card className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => navigate('/flashcards')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200">Study Cards</h3>
                </div>
                <p className="text-sm text-slate-400">
                  AI-generated flashcards for this subject
                </p>
              </Card>

              <Card className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => navigate('/solver')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200">Problem Solver</h3>
                </div>
                <p className="text-sm text-slate-400">
                  Get help with {selectedSubject} problems
                </p>
              </Card>

              <Card className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                    onClick={() => navigate('/progress')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200">Track Progress</h3>
                </div>
                <p className="text-sm text-slate-400">
                  View your {selectedSubject} progress
                </p>
              </Card>
            </div>
          </motion.div>

          {/* Units Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-slate-100 mb-6">Course Units</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {curriculum.units.map((unit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => handleUnitClick(unit)}
                >
                  <Card className="p-6 h-full hover:bg-slate-800/50 transition-all duration-200 group border-slate-700 hover:border-slate-600">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                            {unit.title}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {unit.examWeight}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 mb-4">
                          {unit.topics.length} topics covered
                        </p>
                      </div>
                    </div>

                    {/* Topics Preview */}
                    <div className="space-y-2 mb-4">
                      {unit.topics.slice(0, 3).map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span className="truncate">{typeof topic === 'string' ? topic : topic.name}</span>
                        </div>
                      ))}
                      {unit.topics.length > 3 && (
                        <div className="text-sm text-slate-400">
                          +{unit.topics.length - 3} more topics
                        </div>
                      )}
                    </div>

                    <div className="flex items-center text-blue-400 text-sm">
                      View Unit Details <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl shadow-lg">
              <Book className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              AP Learning Hub
            </h1>
          </div>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Master any AP subject with AI-powered learning. Get personalized diagnostics, 
            practice tests, and study tools tailored to your learning style.
          </p>
        </motion.div>

        {/* AI Features Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">AI Diagnostics</h3>
                  <p className="text-sm text-slate-400">Adaptive assessments</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">Smart Practice</h3>
                  <p className="text-sm text-slate-400">Personalized questions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">Progress Tracking</h3>
                  <p className="text-sm text-slate-400">Detailed analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Award className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-200">Score Prediction</h3>
                  <p className="text-sm text-slate-400">AP score forecasting</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search AP subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {['All', ...Object.keys(SUBJECT_CATEGORIES)].map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category ? 'bg-blue-600 hover:bg-blue-700' : ''}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-slate-400">
              {filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''} found
            </div>
          </Card>
        </motion.div>

        {/* Quick Start Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  onClick={() => navigate('/flashcards')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-slate-200">AI Flashcards</h3>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Get instant flashcard generation for any AP subject. Create personalized study cards.
              </p>
              <div className="flex items-center text-green-400 text-sm">
                Create Cards <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Card>

            <Card className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  onClick={() => navigate('/practice-tests')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-semibold text-slate-200">Practice Tests</h3>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Take full-length AP practice tests with AI-generated questions and instant feedback.
              </p>
              <div className="flex items-center text-blue-400 text-sm">
                Start Practice <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Card>

            <Card className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  onClick={() => navigate('/flashcards')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="font-semibold text-slate-200">AI Flashcards</h3>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Create personalized flashcard decks with AI assistance and smart spaced repetition.
              </p>
              <div className="flex items-center text-green-400 text-sm">
                Create Cards <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Card>

            <Card className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  onClick={() => navigate('/progress')}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                  <TrendingUp className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-slate-200">Progress Tracking</h3>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Track your learning journey with detailed analytics and performance insights.
              </p>
              <div className="flex items-center text-yellow-400 text-sm">
                View Progress <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Subjects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubjects.map(([key, subject], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index % 6) }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
              >
                <Card className="p-6 h-full hover:bg-slate-800/50 transition-all duration-200 group border-slate-700 hover:border-slate-600">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-slate-400 leading-relaxed mb-4">
                        {subject.description || `Master the essential concepts and skills for ${subject.name}. Practice with real AP-style questions and get instant feedback.`}
                      </p>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>Popular Subject</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>3-4 Hours/Week</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubjectClick(key);
                      }}
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {CURRICULUM_DATA[key] ? 'Curriculum' : 'Study'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/flashcards');
                      }}
                      className="flex-1 hover:bg-slate-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Study
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* No Results Message */}
          {filteredSubjects.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">No subjects found</h3>
              <p className="text-slate-400 mb-6">
                Try adjusting your search query or category filter.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </motion.div>

        {/* Call to Action */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <Card className="p-8 bg-gradient-to-r from-purple-600/10 to-blue-600/10 border-purple-500/30">
              <h2 className="text-2xl font-bold text-slate-100 mb-4">
                Unlock Your Full Learning Potential
              </h2>
              <p className="text-lg text-slate-300 mb-6 max-w-2xl mx-auto">
                Sign up for free to track your progress, save your practice sessions, 
                and get personalized study recommendations powered by AI.
              </p>
              <Button
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-8 py-3 text-lg"
                glow
              >
                Get Started Free
              </Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Learn;
