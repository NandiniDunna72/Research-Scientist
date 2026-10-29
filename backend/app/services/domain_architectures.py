import re
from typing import Dict, Any, List, Optional


class DomainArchitectureEngine:
    """
    Synthesizes domain-specific, technically rigorous research system architectures.
    Prevents template duplication across diverse academic research disciplines.
    """

    @classmethod
    def synthesize(
        cls,
        topic: str,
        project_description: Optional[str],
        methodology_data: Dict[str, Any],
        questions_data: List[Dict[str, Any]],
        gaps_data: List[Dict[str, Any]],
        papers_data: List[Dict[str, Any]],
        comparison_data: Dict[str, Any],
        lit_review_data: Dict[str, Any],
        missing_context: List[str],
    ) -> Dict[str, Any]:
        clean_topic = topic.strip()
        topic_lower = clean_topic.lower()

        # Extract IDs and context
        q_ids = [q.get("id", f"Q{i+1}") for i, q in enumerate(questions_data)]
        g_ids = [g.get("id", f"G{i+1}") for i, g in enumerate(gaps_data)]
        p_ids = [p.get("id", f"P{i+1}") for i, p in enumerate(papers_data)]

        # Extract extracted algorithms from papers or methodology
        methods_list = []
        if methodology_data:
            ma = methodology_data.get("methods_and_algorithms", [])
            for item in ma:
                if isinstance(item, dict) and item.get("algorithm_name"):
                    methods_list.append(item.get("algorithm_name"))
        if not methods_list and papers_data:
            for p in papers_data:
                for a in p.get("algorithms_and_models", []):
                    if a and a not in methods_list:
                        methods_list.append(a)

        # 1. Mobility, Traffic, Ambulance, Vehicle Routing & Dispatch
        mobility_keywords = [
            "ambulance", "route", "routing", "traffic", "vehicle", "fleet",
            "dispatch", "navigation", "transport", "mobility", "logistics",
            "path planning", "road", "congestion", "signal", "transit"
        ]
        if any(w in topic_lower for w in mobility_keywords):
            return cls._build_mobility_architecture(
                clean_topic, project_description, q_ids, g_ids, p_ids,
                methods_list, missing_context, papers_data, questions_data, gaps_data
            )

        # 2. Agriculture, Plant Pathology, Foliar Disease & Botany
        agri_keywords = [
            "plant", "crop", "agriculture", "botan", "leaf", "disease",
            "farming", "harvest", "foliar", "soil", "agri", "pest", "apple", "canopy"
        ]
        if any(w in topic_lower for w in agri_keywords):
            return cls._build_agriculture_architecture(
                clean_topic, project_description, q_ids, g_ids, p_ids,
                methods_list, missing_context, papers_data, questions_data, gaps_data
            )

        # 3. Autonomous Robotics, UAVs, Drones & Cyber-Physical Systems
        uav_keywords = [
            "uav", "drone", "robot", "manipulat", "slam", "lidar", "quadrotor",
            "aerial", "autonomous flight", "kinematic", "motion planning"
        ]
        if any(w in topic_lower for w in uav_keywords):
            return cls._build_uav_robotics_architecture(
                clean_topic, project_description, q_ids, g_ids, p_ids,
                methods_list, missing_context, papers_data, questions_data, gaps_data
            )

        # 4. NLP, LLMs, Tutoring, Language Models & Education
        nlp_keywords = [
            "language", "llm", "nlp", "text", "translation", "education",
            "tutor", "hallucination", "dialogue", "pedagog", "speech", "qa system"
        ]
        if any(w in topic_lower for w in nlp_keywords):
            return cls._build_nlp_education_architecture(
                clean_topic, project_description, q_ids, g_ids, p_ids,
                methods_list, missing_context, papers_data, questions_data, gaps_data
            )

        # 5. Biomedical, Oncology & Clinical Healthcare
        clinical_keywords = [
            "cancer", "oncology", "clinical", "biomedical", "radiology",
            "pathology", "patient", "hospital", "biopsy", "genom", "ehr", "mri", "ct scan"
        ]
        if any(w in topic_lower for w in clinical_keywords):
            return cls._build_healthcare_architecture(
                clean_topic, project_description, q_ids, g_ids, p_ids,
                methods_list, missing_context, papers_data, questions_data, gaps_data
            )

        # 6. General / Computer Science / Data-Driven AI Architecture
        return cls._build_universal_dynamic_architecture(
            clean_topic, project_description, q_ids, g_ids, p_ids,
            methods_list, missing_context, papers_data, questions_data, gaps_data
        )

    # -------------------------------------------------------------------------
    # 1. MOBILITY & EMERGENCY ROUTE OPTIMIZATION
    # -------------------------------------------------------------------------
    @classmethod
    def _build_mobility_architecture(
        cls, topic, description, q_ids, g_ids, p_ids, methods, missing_context, papers, questions, gaps
    ) -> Dict[str, Any]:
        primary_algo = methods[0] if methods else "Dynamic Spatio-Temporal Graph Neural Network (ST-GNN)"
        secondary_algo = methods[1] if len(methods) > 1 else "Hierarchical Multi-Agent Reinforcement Learning (MARL)"

        arch_title = f"{topic[:45]} System Architecture"
        arch_type = "Dynamic Spatio-Temporal Graph & Multi-Agent Dispatch Architecture"
        arch_summary = (
            f"An end-to-end intelligent dispatch and dynamic route optimization architecture formulated for '{topic}'. "
            f"The system continuously ingests live GPS vehicle telemetry, municipal traffic sensor feeds, and Computer-Aided "
            f"Dispatch (CAD) incident calls, modeling urban road networks as dynamic time-varying graphs. Real-time path planning "
            f"executes via {primary_algo} coupled with {secondary_algo}, integrating green-wave traffic signal preemption "
            f"and sub-second turn-by-turn routing directly into active emergency response fleets."
        )

        components = [
            {
                "component_id": "comp-telematics-ingestion",
                "component_name": "Real-Time Telematics & Incident Ingestion Gateway",
                "component_type": "data_pipeline",
                "purpose": "Ingest high-throughput vehicle coordinates, municipal traffic sensor feeds, and 911/CAD emergency events.",
                "responsibilities": [
                    "Consume high-frequency GPS telemetry streams from emergency vehicle fleets (MQTT / WebSockets)",
                    "Ingest live municipal traffic sensor APIs and incident status updates with schema validation",
                    "Normalize spatial coordinate references (WGS 84 to local projected CRS) and compute split manifests",
                ],
                "inputs": ["Emergency CAD Call Payloads", "Vehicle GPS Streams (10 Hz)", "Municipal Traffic Loop Sensors"],
                "outputs": ["Normalized Telemetry Events", "Standardized Incident Dispatches", "Vehicle State Manifests"],
                "technologies": ["Apache Kafka", "MQTT Broker", "GeoPandas", "Pydantic"],
                "dependencies": [],
                "related_research_questions": q_ids[:1],
                "related_research_gaps": g_ids[:1],
                "implementation_status": "implemented",
            },
            {
                "component_id": "comp-graph-preprocessor",
                "component_name": "Dynamic Spatio-Temporal Road Graph Engine",
                "component_type": "data_preprocessing",
                "purpose": "Construct and maintain a live topological road network graph with dynamic edge costs.",
                "responsibilities": [
                    "Extract and partition OpenStreetMap (OSM) multi-directed road network topologies",
                    "Compute dynamic edge travel times based on historical congestion and real-time incident reports",
                    "Generate spatial subgraph embeddings for candidate dispatch zones and emergency hospitals",
                ],
                "inputs": ["OpenStreetMap Road Network", "Traffic Congestion Feeds", "Normalized Telemetry Events"],
                "outputs": ["Time-Varying Road Graph G(V, E, W_t)", "Zone Subgraph Partitions", "Dynamic Cost Matrices"],
                "technologies": ["OSMnx", "NetworkX", "PyTorch Geometric", "PostGIS"],
                "dependencies": ["comp-telematics-ingestion"],
                "related_research_questions": q_ids[:2],
                "related_research_gaps": g_ids[:2],
                "implementation_status": "proposed",
            },
            {
                "component_id": "comp-routing-engine",
                "component_name": f"{primary_algo} Optimization Core",
                "component_type": "model_training_and_inference",
                "purpose": f"Compute optimal, dynamic paths and fleet dispatch assignments using {primary_algo}.",
                "responsibilities": [
                    f"Execute online path planning and ETA prediction using {primary_algo}",
                    "Perform multi-agent vehicle-to-call matching balancing response time and coverage preservation",
                    "Dynamically re-route en-route units upon sudden traffic bottleneck or bottleneck emergence",
                ],
                "inputs": ["Dynamic Cost Matrices", "Active Vehicle Fleet States", "Incident Priority Tiers"],
                "outputs": ["Sub-Second Optimized Route Waypoints", "Predicted ETA Bounds", "Dispatch Assignment Vectors"],
                "technologies": ["PyTorch", "PyTorch Geometric", "CUDA 12.x", "Ray Core"],
                "dependencies": ["comp-graph-preprocessor"],
                "related_research_questions": q_ids[:3],
                "related_research_gaps": g_ids[:3],
                "implementation_status": "proposed",
            },
            {
                "component_id": "comp-signal-preemption",
                "component_name": "Municipal V2X Signal Preemption Coordinator",
                "component_type": "decision_engine",
                "purpose": "Interface with municipal traffic controllers to coordinate green-wave signal preemption for active routes.",
                "responsibilities": [
                    "Calculate vehicle arrival timestamps at upcoming signalized intersections",
                    "Trigger green-wave preemption requests adhering to safety interlocks and pedestrian clearance",
                    "Monitor preemption success metrics and update edge traversal penalties dynamically",
                ],
                "inputs": ["Optimized Route Waypoints", "Vehicle Speed & Heading", "Traffic Controller State API"],
                "outputs": ["Preemption Activation Commands", "Signal Timing Overrides", "Intersection Clearance Logs"],
                "technologies": ["NTCIP 1202 Protocol", "MQTT", "Python AsyncIO"],
                "dependencies": ["comp-routing-engine"],
                "related_research_questions": q_ids[1:3] if len(q_ids) > 1 else q_ids,
                "related_research_gaps": g_ids[1:3] if len(g_ids) > 1 else g_ids,
                "implementation_status": "proposed",
            },
            {
                "component_id": "comp-spatial-persistence",
                "component_name": "Spatio-Temporal Registry & Trajectory Store",
                "component_type": "database",
                "purpose": "Persist historical routing traces, road graph snapshots, benchmark datasets, and dispatch logs.",
                "responsibilities": [
                    "Store historical trajectory logs with spatial indexing for post-incident audits and model retraining",
                    "Maintain versioned road network topologies and historical speed profiles across weather/time-of-day",
                    "Log comparative routing performance (Response Time, Route Efficiency, Preemption Success)",
                ],
                "inputs": ["Raw Trajectory Streams", "Computed Routes", "Dispatch Performance Metrics"],
                "outputs": ["Indexed Trajectory Queries", "Historical Benchmark Partitions", "Audit Reports"],
                "technologies": ["PostgreSQL with PostGIS", "TimescaleDB", "Redis Spatial", "MinIO"],
                "dependencies": ["comp-routing-engine", "comp-signal-preemption"],
                "related_research_questions": q_ids,
                "related_research_gaps": g_ids,
                "implementation_status": "implemented",
            },
            {
                "component_id": "comp-dispatch-console",
                "component_name": "Emergency Operations Dispatch API & Mobile Navigation Console",
                "component_type": "api_and_ui",
                "purpose": "Expose sub-second routing endpoints and render real-time vehicle dispatch maps for operators and drivers.",
                "responsibilities": [
                    "Stream real-time turn-by-turn route updates to in-vehicle ambulance mobile terminals",
                    "Provide dispatch operators with situational awareness map dashboards and fleet reallocation tools",
                    "Monitor fleet readiness, hospital receiving capacity, and system latency in real-time",
                ],
                "inputs": ["Operator Commands", "In-Vehicle Status ACKs", "Hospital Triage Capacities"],
                "outputs": ["Interactive Map Visualizations", "Turn-by-Turn Waypoint Streams", "Fleet Telemetry Feeds"],
                "technologies": ["FastAPI", "React / TypeScript", "WebSockets", "MapLibre / Leaflet", "Tailwind CSS"],
                "dependencies": ["comp-routing-engine", "comp-spatial-persistence"],
                "related_research_questions": q_ids[:2],
                "related_research_gaps": g_ids[:2],
                "implementation_status": "optional",
            },
        ]

        diag_source = f"""flowchart TD
  classDef ing fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0f172a;
  classDef prep fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#0f172a;
  classDef core fill:#faf5ff,stroke:#a855f7,stroke-width:2px,color:#0f172a;
  classDef v2x fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#0f172a;
  classDef db fill:#fdf4ff,stroke:#ec4899,stroke-width:2px,color:#0f172a;
  classDef api fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#0f172a;

  subgraph Stage1["1. Telematics & Incident Ingestion"]
    A["Real-Time GPS & CAD Stream"]:::ing --> B["Spatial Validation & Message Broker"]:::ing
  end

  subgraph Stage2["2. Spatio-Temporal Graph Engine"]
    B --> C["Dynamic Road Topology (OSM)"]:::prep
    C --> D["Live Traffic & Congestion Cost Mapper"]:::prep
  end

  subgraph Stage3["3. Route Optimization Core"]
    D --> E["{primary_algo[:32]} Engine"]:::core
    E --> F["Multi-Agent Dispatch & Re-routing Solver"]:::core
  end

  subgraph Stage4["4. Infrastructure & V2X Integration"]
    F --> G["Traffic Signal Green-Wave Preemption"]:::v2x
    G --> H["Municipal V2I Controller Gateway"]:::v2x
  end

  subgraph Stage5["5. Spatial Persistence & Cache"]
    C -.-> I[("PostGIS Dynamic Road Graph")]:::db
    E -.-> J[("TimescaleDB Trajectory Store & Redis Cache")]:::db
  end

  subgraph Stage6["6. Operations & Navigation Client"]
    H --> K["Emergency Operations Dispatch API"]:::api
    K --> L["Mobile In-Ambulance Navigation HUD"]:::api
  end

  J -.-> K"""

        diagram = {
            "diagram_type": "mermaid",
            "source": diag_source,
            "description": (
                f"Dynamic emergency routing architecture lifecycle for '{topic[:40]}'. "
                f"GPS telemetry and CAD incident streams are projected onto dynamic road graphs, "
                f"optimized in real-time via {primary_algo}, synchronized with traffic signals via V2X, "
                f"and streamed to in-vehicle terminals and emergency dispatch consoles."
            ),
        }

        data_flow = [
            {
                "step_number": 1,
                "source_component": "GPS Units & 911 CAD Dispatch System",
                "destination_component": "Real-Time Telematics & Incident Ingestion Gateway",
                "data_transferred": "Live GPS coordinates (lat/long/speed/heading), emergency incident priority, location tags",
                "processing_performed": "Coordinate projection (EPSG:4326 to UTM), schema verification, message deduplication",
                "output_produced": "Validated telemetry events and prioritized incident payloads",
                "phase": "general",
            },
            {
                "step_number": 2,
                "source_component": "Telematics Ingestion Gateway",
                "destination_component": "Dynamic Spatio-Temporal Road Graph Engine",
                "data_transferred": "Filtered telemetry streams and municipal loop detector flow rates",
                "processing_performed": "Map-matching GPS points to road segments, calculating dynamic edge weights, time-slice indexing",
                "output_produced": "Dynamic weighted road network subgraph G_t(V, E, W)",
                "phase": "preprocessing",
            },
            {
                "step_number": 3,
                "source_component": "Dynamic Road Graph Engine",
                "destination_component": f"{primary_algo} Optimization Core",
                "data_transferred": "Weighted topological road graph, vehicle fleet positions, target emergency locations",
                "processing_performed": "Parallel shortest path computation, congestion avoidance inference, fleet reallocation heuristic",
                "output_produced": "Optimal trajectory waypoint sequences and sub-second ETA estimates",
                "phase": "training",
            },
            {
                "step_number": 4,
                "source_component": f"{primary_algo} Optimization Core",
                "destination_component": "Spatio-Temporal Registry & Trajectory Store",
                "data_transferred": "Computed path geometry, predicted travel time, model weights, execution latency",
                "processing_performed": "Spatial indexing, time-series partitioning in TimescaleDB, Redis caching of active route",
                "output_produced": "Versioned route records and low-latency cache keys for active dispatch",
                "phase": "training",
            },
            {
                "step_number": 5,
                "source_component": f"{primary_algo} Optimization Core",
                "destination_component": "Municipal V2X Signal Preemption Coordinator",
                "data_transferred": "Route segment intersections, estimated time-of-arrival per signalized junction",
                "processing_performed": "Green-wave phase timing calculation, conflict check with cross-street emergency vehicles",
                "output_produced": "NTCIP-compliant signal preemption pulses and timing window schedules",
                "phase": "inference",
            },
            {
                "step_number": 6,
                "source_component": "Municipal V2X Coordinator",
                "destination_component": "Emergency Operations Dispatch API & Mobile Navigation Console",
                "data_transferred": "Preempted route waypoints, signal clearance statuses, active traffic alerts",
                "processing_performed": "WebSocket push serialization, turn-by-turn guidance rendering, dispatch dashboard updates",
                "output_produced": "Live in-cab navigation map and operational dispatch management console",
                "phase": "inference",
            },
        ]

        technology_stack = [
            {
                "category": "AI/ML & Graph Analytics",
                "technology": "PyTorch Geometric & NetworkX",
                "role": "Spatio-temporal graph neural networks, dynamic shortest path heuristics, and multi-agent fleet dispatch",
                "reason_for_selection": "Native GPU-accelerated graph message passing capable of sub-second inference on city-scale road topologies.",
                "alternatives": ["DGL (Deep Graph Library)", "Graph-Tool", "OR-Tools"],
                "status": "suggested",
            },
            {
                "category": "Geospatial Data Processing",
                "technology": "OSMnx & GeoPandas",
                "role": "OpenStreetMap road network ingestion, spatial topology modeling, and map-matching algorithms",
                "reason_for_selection": "Industry standard for street network analysis with built-in routing topology validation.",
                "alternatives": ["Valhalla", "OSRM", "GraphHopper"],
                "status": "suggested",
            },
            {
                "category": "Real-Time Streaming & APIs",
                "technology": "FastAPI, WebSockets & Apache Kafka",
                "role": "High-throughput telemetry message broker and sub-second full-duplex navigation streaming",
                "reason_for_selection": "Guarantees sub-100ms end-to-end communication latency between vehicles and dispatch headquarters.",
                "alternatives": ["RabbitMQ", "MQTT / EMQX", "gRPC"],
                "status": "current",
            },
            {
                "category": "Geospatial Database & Cache",
                "technology": "PostgreSQL with PostGIS & Redis",
                "role": "Spatial indexing of urban road networks, trajectory history storage, and ultra-fast in-memory routing cache",
                "reason_for_selection": "Reuses existing PostgreSQL cluster with native spatial operators (ST_DWithin, ST_Distance) and Redis TTL caching.",
                "alternatives": ["TimescaleDB", "ScyllaDB", "Elasticsearch"],
                "status": "current",
            },
            {
                "category": "Traffic Preemption & V2X",
                "technology": "NTCIP 1202 / V2I Protocol Coordinator",
                "role": "Municipal traffic signal controller preemption and green-wave timing synchronization",
                "reason_for_selection": "Standardized North American / European intelligent transportation system (ITS) interface.",
                "alternatives": ["OpenV2X", "SUMO TraCI Simulator"],
                "status": "suggested",
            },
            {
                "category": "Navigation & Dashboard UI",
                "technology": "React, TypeScript, MapLibre GL & Tailwind CSS",
                "role": "In-vehicle mobile navigation interface, real-time vehicle marker animation, and dispatch dashboard",
                "reason_for_selection": "Hardware-accelerated WebGL vector map rendering integrated seamlessly into existing application.",
                "alternatives": ["Leaflet", "Deck.gl", "Mapbox GL JS"],
                "status": "current",
            },
        ]

        data_storage_design = {
            "storage_paradigm": "Geospatial Relational (PostgreSQL/PostGIS) with Spatial Cache (Redis)",
            "description": (
                "A high-throughput spatial architecture combining PostGIS for road graphs and incident records, "
                "TimescaleDB for high-frequency GPS vehicle trajectory points, and Redis for volatile active route caches."
            ),
            "entities": [
                {
                    "entity_name": "emergency_incidents",
                    "purpose": "Stores incoming 911 dispatch calls, severity triage levels, and target emergency coordinates.",
                    "fields": ["id (UUID)", "call_time (TIMESTAMP)", "priority_level (INT)", "location (GEOMETRY(Point))", "status (VARCHAR)"],
                    "relationships": ["1:N with dispatch_assignments", "1:N with route_trajectories"],
                },
                {
                    "entity_name": "ambulance_fleet",
                    "purpose": "Maintains vehicle inventory, crew capabilities, current home station, and operational status.",
                    "fields": ["id (UUID)", "vehicle_code (VARCHAR)", "station_id (FK)", "equipment_tier (VARCHAR)", "is_available (BOOLEAN)"],
                    "relationships": ["1:N with dispatch_assignments", "1:N with telemetry_pings"],
                },
                {
                    "entity_name": "road_network_nodes",
                    "purpose": "Topological vertices and intersections in the municipal road network with dynamic cost weights.",
                    "fields": ["id (BIGINT)", "geom (GEOMETRY(Point))", "connected_edges (BIGINT[])", "signalized (BOOLEAN)"],
                    "relationships": ["1:N with road_network_edges"],
                },
                {
                    "entity_name": "route_trajectories",
                    "purpose": "Calculated optimal waypoints, predicted travel times, and actual realized travel times.",
                    "fields": ["id (UUID)", "incident_id (FK)", "vehicle_id (FK)", "path_linestring (GEOMETRY(LineString))", "predicted_eta_sec (FLOAT)"],
                    "relationships": ["N:1 with emergency_incidents", "N:1 with ambulance_fleet"],
                },
            ],
            "er_diagram": {
                "diagram_type": "mermaid",
                "source": """erDiagram
  EMERGENCY_INCIDENTS ||--o{ ROUTE_TRAJECTORIES : triggers
  AMBULANCE_FLEET ||--o{ ROUTE_TRAJECTORIES : assigned_to
  ROAD_NETWORK_NODES ||--o{ ROUTE_TRAJECTORIES : spans
  ROUTE_TRAJECTORIES ||--o{ TELEMETRY_PINGS : records""",
            },
        }

        security_and_reliability = [
            {
                "dimension": "High Availability & Mission-Critical Reliability",
                "description": "Emergency dispatch failure could lead to loss of life if routing service experiences downtime.",
                "mitigation_strategy": (
                    "Deploy active-passive routing engine replicas; if GNN inference exceeds 1500ms timeout, "
                    "instantly fallback to local in-memory Dijkstra / Contraction Hierarchies with cached edge weights."
                ),
            },
            {
                "dimension": "GPS Spoofing & Telemetry Integrity",
                "description": "Corrupted or spoofed vehicle GPS pings could mislead dispatch allocation algorithms.",
                "mitigation_strategy": (
                    "Apply Extended Kalman Filtering (EKF) and map-matching plausibility bounds to reject anomalous GPS jumps "
                    "(e.g., speed > 160 km/h or impossible topological transitions)."
                ),
            },
            {
                "dimension": "Secure Municipal V2X Interfacing",
                "description": "Unauthorized signal preemption injection could disrupt municipal traffic networks.",
                "mitigation_strategy": (
                    "Cryptographically sign all V2I preemption tokens using IEEE 1609.2 PKI certificates and mutual TLS (mTLS)."
                ),
            },
            {
                "dimension": "Patient Location Data Privacy",
                "description": "Emergency incident call addresses constitute Protected Health Information (PHI).",
                "mitigation_strategy": (
                    "Encrypt location data at rest with AES-256; truncate coordinates in public transit logs to 500m grid cells."
                ),
            },
        ]

        deployment_architecture = {
            "deployment_model": "Hybrid Edge-Cloud Distributed Emergency Dispatch Architecture",
            "minimum_viable_deployment": (
                "Cloud server equipped with 8 vCPUs, 32GB RAM, 1x NVIDIA RTX 4000 GPU (16GB VRAM) for GNN path inference, "
                "PostgreSQL 16 with PostGIS extension, and Redis 7 on Docker Compose."
            ),
            "production_enhancements": (
                "Kubernetes cluster with multi-zone redundancy, Kafka message cluster for telemetry streaming, "
                "and ruggedized in-vehicle edge computing units (e.g. NVIDIA Jetson Orin Nano) running cached local graph routing."
            ),
            "hosting_components": [
                "FastAPI Dispatch & Navigation API (Dockerized, K8s auto-scaled)",
                "PostgreSQL 16 Database with PostGIS 3.4 Spatial Extensions",
                "Redis Spatial Cache for sub-second ETA and vehicle locations",
                "In-Vehicle Mobile Web Client (PWA on In-Cab Tablets)",
            ],
            "environment_configuration": [
                "MAX_ROUTING_TIMEOUT_MS=500",
                "REDIS_CACHE_TTL_SEC=10",
                "POSTGIS_DATABASE_URL=postgresql://user:pass@localhost:5432/emergency_route_db",
                "ENABLE_V2X_PREEMPTION=true",
            ],
            "scaling_considerations": (
                "Computational bottleneck arises during simultaneous peak incident surges (e.g., severe storm/mass casualty). "
                "Partition the city graph into localized Voronoi dispatch regions to enable independent parallel routing workers."
            ),
        }

        architecture_justification = [
            {
                "objective_or_gap": "Overcoming volatile traffic delays and dynamic urban congestion bottlenecks",
                "architectural_choice": f"Decoupled Ingestion & Spatio-Temporal Graph Core with {primary_algo}",
                "justification": (
                    "Static route planners (Google Maps / standard A*) fail during sudden incidents. Coupling dynamic "
                    "graph edge updates with spatio-temporal neural embeddings allows the system to predict congestion propagation "
                    "5-15 minutes into the future along the ambulance's transit corridor."
                ),
                "trade_offs": "Requires continuous ingestion of traffic sensor feeds; mitigated by lightweight Redis pub/sub.",
                "related_question_ids": q_ids[:1],
                "related_gap_ids": g_ids[:1],
            },
            {
                "objective_or_gap": "Eliminating intersection delay and red-light collision hazards",
                "architectural_choice": "Dedicated Municipal V2X Signal Preemption Coordinator",
                "justification": (
                    "Intersections account for up to 40% of emergency transit delays and severe vehicle collisions. "
                    "Preemption guarantees green-wave passage, reducing ambulance transit times by 20-35% on critical dispatches."
                ),
                "trade_offs": "Requires coordination protocols with municipal traffic departments.",
                "related_question_ids": q_ids[1:2] if len(q_ids) > 1 else q_ids,
                "related_gap_ids": g_ids[1:2] if len(g_ids) > 1 else g_ids,
            },
            {
                "objective_or_gap": "Sub-second dispatch response guarantees without network dropouts",
                "architectural_choice": "Hybrid Edge Cache with In-Vehicle Offline Graph Fallback",
                "justification": (
                    "Guarantees that ambulances operating in cellular dead zones (tunnels, urban canyons) never lose navigation "
                    "guidance by maintaining local offline graph partitions on in-vehicle terminals."
                ),
                "trade_offs": "Requires periodic background syncing of road network updates to mobile clients (~15MB/day).",
                "related_question_ids": q_ids[2:3] if len(q_ids) > 2 else q_ids,
                "related_gap_ids": g_ids[2:3] if len(g_ids) > 2 else g_ids,
            },
        ]

        alternative_architectures = [
            {
                "title": "Static Centralized Cloud Navigation (Google Directions / Mapbox API)",
                "description": "Rely entirely on external commercial cloud navigation APIs without custom emergency vehicle preemption.",
                "advantages": ["No server infrastructure to maintain", "Zero road graph compilation"],
                "disadvantages": ["Lacks emergency signal preemption", "No multi-agent fleet coordination", "High latency (>1200ms per query)"],
                "complexity": "Low (Off-the-shelf)",
                "suitable_conditions": "Non-emergency routine delivery or civilian ride-sharing.",
                "rejection_reason": "Incompatible with sub-second emergency response requirements and cannot coordinate municipal traffic signals.",
            },
            {
                "title": "Fully Autonomous Decentralized Ad-Hoc Mesh Routing",
                "description": "Vehicles communicate solely peer-to-peer via DSRC/C-V2X mesh without central dispatch coordination.",
                "advantages": ["Zero central point of failure", "Immune to central cloud downtime"],
                "disadvantages": ["Requires 100% vehicle hardware penetration", "Infeasible city-wide global traffic visibility"],
                "complexity": "Extremely High (Hardware dependency)",
                "suitable_conditions": "Military convoys or isolated disaster zones without civil infrastructure.",
                "rejection_reason": "Excessive implementation complexity and lack of municipal infrastructure readiness.",
            },
        ]

        implementation_plan = [
            {
                "stage_number": 1,
                "stage_name": "Road Graph & Telemetry Stream Pipeline Setup",
                "tasks": [
                    "Download and clean city-scale OpenStreetMap road network graph using OSMnx",
                    "Configure PostGIS spatial schema and TimescaleDB trajectory tables",
                    "Establish Kafka / WebSocket telematics ingestion pipeline for vehicle GPS pings",
                ],
                "dependencies": ["City GIS road data files"],
                "deliverable": "Working dynamic road graph database with real-time GPS stream simulator",
                "verification_method": "Unit test confirming map-matching accuracy > 98% on recorded historical ambulance trips",
            },
            {
                "stage_number": 2,
                "stage_name": f"{primary_algo} Dynamic Path Planning Core Implementation",
                "tasks": [
                    "Implement dynamic cost function accounting for live congestion and intersection delays",
                    "Construct PyTorch Geometric routing model with time-varying edge weights",
                    "Benchmark path calculation latency across 10,000 simulated emergency queries",
                ],
                "dependencies": ["Stage 1 road graph"],
                "deliverable": "Sub-second dynamic routing engine library with benchmark test suite",
                "verification_method": "Path computation latency < 150ms on graph with > 50,000 nodes",
            },
            {
                "stage_number": 3,
                "stage_name": "V2X Signal Preemption & Dispatch Dashboard Integration",
                "tasks": [
                    "Implement NTCIP 1202 preemption coordinator module with safety timers",
                    "Build WebSocket streaming layer connecting routing engine to dispatch console",
                    "Construct MapLibre GL live ambulance tracking and route visualization frontend",
                ],
                "dependencies": ["Stage 2 routing engine"],
                "deliverable": "Full-stack dispatch management dashboard with simulated traffic signals",
                "verification_method": "End-to-end route recalculation triggered and rendered within 500ms of incident creation",
            },
            {
                "stage_number": 4,
                "stage_name": "Field Validation, Stress Testing & Edge Deployment",
                "tasks": [
                    "Simulate peak traffic congestion conditions (e.g., rush hour mass casualty event)",
                    "Deploy offline routing fallback on ruggedized tablet client",
                    "Conduct comparative response time benchmark against baseline static routes",
                ],
                "dependencies": ["Stage 3 full-stack system"],
                "deliverable": "Validated emergency routing platform with statistical significance report",
                "verification_method": "Statistically significant (p < 0.01) response time reduction >= 18% over standard routes",
            },
        ]

        limitations_and_assumptions = [
            {
                "category": "Communication & Connectivity Ceiling",
                "description": "Assumes minimum 4G/LTE cellular coverage across 95% of service territory for real-time traffic updates.",
            },
            {
                "category": "Municipal Infrastructure Cooperation",
                "description": "Signal preemption efficacy relies on compatibility with municipal traffic controller firmware.",
            },
            {
                "category": "GPS Accuracy in Urban Canyons",
                "description": "Multipath GPS reflections between high-rise buildings may cause momentary 10-20m map-matching inaccuracies.",
            },
        ]

        return {
            "topic": topic,
            "architecture_title": arch_title,
            "architecture_type": arch_type,
            "architecture_summary": arch_summary,
            "components": components,
            "architecture_diagram": diagram,
            "data_flow": data_flow,
            "technology_stack": technology_stack,
            "data_storage_design": data_storage_design,
            "security_and_reliability": security_and_reliability,
            "deployment_architecture": deployment_architecture,
            "architecture_justification": architecture_justification,
            "alternative_architectures": alternative_architectures,
            "implementation_plan": implementation_plan,
            "limitations_and_assumptions": limitations_and_assumptions,
            "missing_upstream_context": missing_context,
        }

    # -------------------------------------------------------------------------
    # 2. AGRICULTURE & PLANT PATHOLOGY ARCHITECTURE
    # -------------------------------------------------------------------------
    @classmethod
    def _build_agriculture_architecture(
        cls, topic, description, q_ids, g_ids, p_ids, methods, missing_context, papers, questions, gaps
    ) -> Dict[str, Any]:
        primary_algo = methods[0] if methods else "Multi-Scale Vision Transformer (ViT) & Masked Autoencoder"
        secondary_algo = methods[1] if len(methods) > 1 else "Physics-Informed Disease Spread Forecaster"

        arch_title = f"{topic[:45]} System Architecture"
        arch_type = "Spatial-Temporal Agro-Vision & Foliar Pathology Surveillance Architecture"
        arch_summary = (
            f"An end-to-end computer vision and epidemiological surveillance architecture designed for '{topic}'. "
            f"The architecture ingests multispectral drone imagery, handheld foliar photographs, and microclimatic weather logs, "
            f"preprocesses leaf canopies via standardized segmentation masks, and executes early disease diagnosis using "
            f"{primary_algo} combined with {secondary_algo} for disease spread forecasting and agronomist treatment planning."
        )

        components = [
            {
                "component_id": "comp-field-ingestion",
                "component_name": "Multispectral Drone & Field Sensor Ingestion Gateway",
                "component_type": "data_pipeline",
                "purpose": "Ingest aerial multispectral surveys, handheld smartphone foliar photographs, and field weather station metrics.",
                "responsibilities": [
                    "Handle high-resolution multi-band drone ortho-mosaics and smartphone RGB leaf images",
                    "Ingest microclimatic timeseries (temperature, relative humidity, leaf wetness, rainfall)",
                    "Normalize radiometric calibration values and geo-tag canopy samples to field parcel coordinates",
                ],
                "inputs": ["Drone Multispectral Surveys (NDVI/RGB)", "Field Scout Smartphone Images", "Weather Station Timeseries"],
                "outputs": ["Calibrated Foliar Image Tensors", "Parcel Geo-Location Metadata", "Hourly Climate Data Frames"],
                "technologies": ["OpenCV", "Rasterio", "GDAL", "FastAPI"],
                "dependencies": [],
                "related_research_questions": q_ids[:1],
                "related_research_gaps": g_ids[:1],
                "implementation_status": "implemented",
            },
            {
                "component_id": "comp-canopy-segmentation",
                "component_name": "Canopy Extraction & Lesion Preprocessing Engine",
                "component_type": "data_preprocessing",
                "purpose": "Isolate foliar leaf surfaces, remove background soil/weed clutter, and extract symptom lesions.",
                "responsibilities": [
                    "Segment individual leaves from dense canopy clutter using semantic segmentation masks",
                    "Extract normalized vegetative indices (NDVI, NDRE) and lesion chromaticity features",
                    "Apply realistic outdoor augmentations (varying sunlight conditions, shadow casting, leaf orientation)",
                ],
                "inputs": ["Calibrated Foliar Image Tensors", "Raw Sensor Streams"],
                "outputs": ["Background-Isolated Leaf Tensors", "Lesion Region Masks", "Vegetative Index Heatmaps"],
                "technologies": ["PyTorch", "Albumentations", "Segment Anything Model (SAM)", "TorchVision"],
                "dependencies": ["comp-field-ingestion"],
                "related_research_questions": q_ids[:2],
                "related_research_gaps": g_ids[:2],
                "implementation_status": "proposed",
            },
            {
                "component_id": "comp-disease-core",
                "component_name": f"{primary_algo} Diagnostic Core",
                "component_type": "model_training_and_inference",
                "purpose": f"Execute foliar disease classification, severity grading, and multi-pathogen diagnosis using {primary_algo}.",
                "responsibilities": [
                    f"Perform multi-class foliar pathology diagnosis and severity percentage grading via {primary_algo}",
                    "Disentangle nutritional deficiencies from biotic fungal/bacterial/viral infections",
                    "Compute spatial attention heatmaps highlighting pathognomonic symptom lesions on leaf blades",
                ],
                "inputs": ["Background-Isolated Leaf Tensors", "Lesion Region Masks", "Cultivar Taxonomy Labels"],
                "outputs": ["Disease Probability Distributions", "Severity Grade Scores", "Attention Class Activation Maps"],
                "technologies": ["PyTorch", "HuggingFace Transformers", "CUDA 12.x", "Timm"],
                "dependencies": ["comp-canopy-segmentation"],
                "related_research_questions": q_ids[:3],
                "related_research_gaps": g_ids[:3],
                "implementation_status": "proposed",
            },
            {
                "component_id": "comp-epidemiological-spread",
                "component_name": "Microclimate Epidemiological Spread Modeler",
                "component_type": "decision_engine",
                "purpose": "Simulate pathogen spore dispersal and forecast disease outbreak probabilities across neighboring parcels.",
                "responsibilities": [
                    "Fuse vision diagnostic results with microclimate humidity and wind vector telemetry",
                    "Compute disease transmission risk scores using biophysical infection models",
                    "Generate automated preventive fungicide and biological treatment recommendations",
                ],
                "inputs": ["Disease Probability Distributions", "Hourly Climate Data Frames", "Field Parcel Coordinates"],
                "outputs": ["7-Day Outbreak Risk Forecasts", "Agronomic Action Recommendations", "Spread Velocity Heatmaps"],
                "technologies": ["SciPy", "NumPy", "XGBoost", "Python AsyncIO"],
                "dependencies": ["comp-disease-core"],
                "related_research_questions": q_ids[1:3] if len(q_ids) > 1 else q_ids,
                "related_research_gaps": g_ids[1:3] if len(g_ids) > 1 else g_ids,
                "implementation_status": "proposed",
            },
            {
                "component_id": "comp-agro-persistence",
                "component_name": "Agro-Climatic Spatial Registry & Vector Feature Store",
                "component_type": "database",
                "purpose": "Persist historical disease surveillance scans, spectral embeddings, weather logs, and treatment records.",
                "responsibilities": [
                    "Maintain spatial GIS parcel boundaries and historical infestation timelines in PostgreSQL/PostGIS",
                    "Store high-dimensional vision embeddings for few-shot retrieval of novel pathogen mutations",
                    "Track model checkpoint weights, ablation runs, and multi-cultivar validation benchmarks",
                ],
                "inputs": ["Foliar Feature Vectors", "Survey Geo-Coordinates", "Model Weights", "Treatment Outcomes"],
                "outputs": ["Indexed Temporal Infestation Records", "Cultivar Benchmark Partitions", "Nearest Pathogen Matches"],
                "technologies": ["PostgreSQL with PostGIS", "TimescaleDB", "Qdrant / pgvector", "MinIO"],
                "dependencies": ["comp-disease-core", "comp-epidemiological-spread"],
                "related_research_questions": q_ids,
                "related_research_gaps": g_ids,
                "implementation_status": "implemented",
            },
            {
                "component_id": "comp-agronomist-console",
                "component_name": "Agronomist Decision Support API & Mobile Field Scout Client",
                "component_type": "api_and_ui",
                "purpose": "Deliver instant diagnostic feedback to field scouts and present farm-wide disease surveillance heatmaps.",
                "responsibilities": [
                    "Provide lightweight, offline-capable progressive web application for field agronomists",
                    "Render interactive GIS disease severity heatmaps overlaid on satellite farm maps",
                    "Generate downloadable academic and extension advisory PDF reports",
                ],
                "inputs": ["Field Scout Queries", "Parcel Inspection Filters", "Advisory Preferences"],
                "outputs": ["Field Inspection Dashboards", "Prescriptive Spray Guidelines", "Epidemiological Heatmaps"],
                "technologies": ["FastAPI", "React / TypeScript", "Tailwind CSS", "MapLibre GL", "Recharts"],
                "dependencies": ["comp-disease-core", "comp-agro-persistence"],
                "related_research_questions": q_ids[:2],
                "related_research_gaps": g_ids[:2],
                "implementation_status": "optional",
            },
        ]

        diag_source = f"""flowchart TD
  classDef ing fill:#f0f9ff,stroke:#0284c7,stroke-width:2px,color:#0f172a;
  classDef prep fill:#eef2ff,stroke:#6366f1,stroke-width:2px,color:#0f172a;
  classDef core fill:#faf5ff,stroke:#a855f7,stroke-width:2px,color:#0f172a;
  classDef eval fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#0f172a;
  classDef db fill:#fdf4ff,stroke:#ec4899,stroke-width:2px,color:#0f172a;
  classDef api fill:#f0fdf4,stroke:#22c55e,stroke-width:2px,color:#0f172a;

  subgraph Stage1["1. Multispectral & Field Sensor Ingestion"]
    A["Drone Surveys & Smartphone Leaf Images"]:::ing --> B["Radiometric Calibration & Spatial Tagger"]:::ing
  end

  subgraph Stage2["2. Canopy & Lesion Segmentation"]
    B --> C["Canopy Isolation & Soil Masking (SAM)"]:::prep
    C --> D["Lesion Chromaticity & NDVI Indexing"]:::prep
  end

  subgraph Stage3["3. Pathogen Diagnostic Core"]
    D --> E["{primary_algo[:32]} Engine"]:::core
    E --> F["Severity Grading & Multi-Pathogen Classifier"]:::core
  end

  subgraph Stage4["4. Epidemiological Forecasting"]
    F --> G["Microclimate Spore Dispersal Simulator"]:::eval
    G --> H["7-Day Outbreak Risk & Treatment Engine"]:::eval
  end

  subgraph Stage5["5. Agro-Spatial Persistence"]
    C -.-> I[("PostGIS Field Parcels & Foliar Vectors")]:::db
    E -.-> J[("TimescaleDB Weather Logs & Model Checkpoints")]:::db
  end

  subgraph Stage6["6. Advisory API & Scout Console"]
    H --> K["Agronomist Decision Support API"]:::api
    K --> L["Mobile Field Scout App & Spatial Heatmaps"]:::api
  end

  J -.-> K"""

        diagram = {
            "diagram_type": "mermaid",
            "source": diag_source,
            "description": (
                f"Agronomic disease surveillance pipeline for '{topic[:40]}'. "
                f"Foliar imagery and field sensors undergo canopy segmentation, multi-scale diagnosis via {primary_algo}, "
                f"spore dispersal modeling, and delivery via mobile field advisory interfaces."
            ),
        }

        data_flow = [
            {
                "step_number": 1,
                "source_component": "Drone Multispectral Camera & Smartphone Field Scouts",
                "destination_component": "Multispectral Drone & Field Sensor Ingestion Gateway",
                "data_transferred": "Raw multi-band GeoTIFF mosaics, RGB JPEG leaf close-ups, weather station CSV streams",
                "processing_performed": "Radiometric calibration, EXIF GPS coordinate extraction, cloud mask filtering",
                "output_produced": "Georeferenced foliar image batches and microclimate telemetry records",
                "phase": "general",
            },
            {
                "step_number": 2,
                "source_component": "Field Sensor Ingestion Gateway",
                "destination_component": "Canopy Extraction & Lesion Preprocessing Engine",
                "data_transferred": "Calibrated leaf image tiles and parcel boundaries",
                "processing_performed": "Foliar background removal via SAM, color space transformation (HSV/Lab), NDVI calculation",
                "output_produced": "Cleaned leaf mask tensors and normalized vegetative index arrays",
                "phase": "preprocessing",
            },
            {
                "step_number": 3,
                "source_component": "Canopy Extraction Engine",
                "destination_component": f"{primary_algo} Diagnostic Core",
                "data_transferred": "Segmented leaf tensors, lesion bounding masks, cultivar metadata",
                "processing_performed": "Multi-head attention feature extraction, contrastive lesion clustering, cross-entropy loss computation",
                "output_produced": "Pathogen diagnostic probabilities, affected canopy percentage, attention heatmaps",
                "phase": "training",
            },
            {
                "step_number": 4,
                "source_component": f"{primary_algo} Diagnostic Core",
                "destination_component": "Agro-Climatic Spatial Registry & Vector Feature Store",
                "data_transferred": "Deep foliar embeddings, diagnostic labels, model weights, validation metrics",
                "processing_performed": "Vector indexing via pgvector, parcel spatial join, audit logging",
                "output_produced": "Queryable historical disease maps and indexed pathogen embedding vectors",
                "phase": "training",
            },
            {
                "step_number": 5,
                "source_component": f"{primary_algo} Diagnostic Core",
                "destination_component": "Microclimate Epidemiological Spread Modeler",
                "data_transferred": "Confirmed infection coordinates, pathogen strain classification, microclimate humidity logs",
                "processing_performed": "Biophysical spore transport simulation, infection threshold evaluation",
                "output_produced": "Outbreak velocity vectors and targeted treatment timing schedules",
                "phase": "inference",
            },
            {
                "step_number": 6,
                "source_component": "Epidemiological Spread Modeler",
                "destination_component": "Agronomist Decision Support API & Mobile Field Scout Client",
                "data_transferred": "Field severity heatmaps, diagnosis reports, prescription recommendations",
                "processing_performed": "GIS vector tile rendering, offline cache packaging, alert push notification",
                "output_produced": "Interactive agronomic surveillance dashboard and field scout mobile advisory UI",
                "phase": "inference",
            },
        ]

        technology_stack = [
            {
                "category": "Vision & Deep Learning",
                "technology": "PyTorch, TorchVision & Timm",
                "role": "Vision Transformer backbone, lesion segmentation, and multi-task foliar pathology grading",
                "reason_for_selection": "Extensive pre-trained vision architectures with state-of-the-art transfer learning for agricultural datasets.",
                "alternatives": ["TensorFlow / Keras", "YOLOv8 / Ultralytics", "FastAI"],
                "status": "suggested",
            },
            {
                "category": "Agricultural Image Processing",
                "technology": "OpenCV, Albumentations & Rasterio",
                "role": "Multispectral band alignment, vegetative index computation (NDVI, NDRE), and outdoor illumination augmentation",
                "reason_for_selection": "High-throughput raster manipulation for both UAV ortho-mosaics and smartphone photos.",
                "alternatives": ["GDAL", "Scikit-Image", "Pillow"],
                "status": "suggested",
            },
            {
                "category": "Backend Serving & APIs",
                "technology": "FastAPI & Python 3.11+",
                "role": "Asynchronous REST API endpoints for batch aerial surveys and real-time smartphone field diagnosis",
                "reason_for_selection": "Native asynchronous IO handling multi-part image uploads with sub-second response times.",
                "alternatives": ["TorchServe", "Flask", "Django REST Framework"],
                "status": "current",
            },
            {
                "category": "Spatial & Environmental Database",
                "technology": "PostgreSQL with PostGIS & TimescaleDB",
                "role": "Farm parcel polygon storage, historical infection mapping, and microclimate timeseries indexing",
                "reason_for_selection": "Integrated spatial and temporal indexing in a single unified database deployment.",
                "alternatives": ["GeoServer", "InfluxDB", "MongoDB Geospatial"],
                "status": "current",
            },
            {
                "category": "Mobile Client & UI",
                "technology": "React, TypeScript, PWA & Leaflet",
                "role": "Offline-capable mobile field scout client and desktop agronomic GIS dashboard",
                "reason_for_selection": "Progressive Web App support enables offline field image capture in remote rural areas.",
                "alternatives": ["Flutter", "React Native", "Mapbox GL JS"],
                "status": "current",
            },
        ]

        data_storage_design = {
            "storage_paradigm": "Geospatial Relational (PostgreSQL/PostGIS) with Time-Series Storage (TimescaleDB)",
            "description": (
                "A hybrid agricultural schema tracking farm parcels, survey flights, individual leaf specimens, "
                "diagnostic infection logs, and microclimatic weather station observations."
            ),
            "entities": [
                {
                    "entity_name": "farm_parcels",
                    "purpose": "Stores agricultural field boundaries, crop cultivar species, planting dates, and soil types.",
                    "fields": ["id (UUID)", "parcel_name (VARCHAR)", "boundary (GEOMETRY(Polygon))", "crop_species (VARCHAR)", "area_hectares (FLOAT)"],
                    "relationships": ["1:N with survey_missions", "1:N with disease_detections"],
                },
                {
                    "entity_name": "survey_missions",
                    "purpose": "Records aerial UAV drone flights or field scout sampling rounds across a farm parcel.",
                    "fields": ["id (UUID)", "parcel_id (FK)", "survey_date (TIMESTAMP)", "platform (VARCHAR)", "image_count (INT)"],
                    "relationships": ["N:1 with farm_parcels", "1:N with foliar_specimens"],
                },
                {
                    "entity_name": "foliar_specimens",
                    "purpose": "Individual leaf imagery, bounding coordinates, extracted vegetative indices, and raw file handles.",
                    "fields": ["id (UUID)", "survey_id (FK)", "image_uri (VARCHAR)", "ndvi_mean (FLOAT)", "geom (GEOMETRY(Point))"],
                    "relationships": ["N:1 with survey_missions", "1:1 with disease_detections"],
                },
                {
                    "entity_name": "disease_detections",
                    "purpose": "Model diagnosis records including pathogen class, severity rating, confidence score, and advisory status.",
                    "fields": ["id (UUID)", "specimen_id (FK)", "pathogen_name (VARCHAR)", "severity_percent (FLOAT)", "confidence (FLOAT)"],
                    "relationships": ["1:1 with foliar_specimens", "N:1 with farm_parcels"],
                },
            ],
            "er_diagram": {
                "diagram_type": "mermaid",
                "source": """erDiagram
  FARM_PARCELS ||--o{ SURVEY_MISSIONS : contains
  SURVEY_MISSIONS ||--o{ FOLIAR_SPECIMENS : collects
  FOLIAR_SPECIMENS ||--o{ DISEASE_DETECTIONS : yields
  FARM_PARCELS ||--o{ WEATHER_OBSERVATIONS : monitors""",
            },
        }

        security_and_reliability = [
            {
                "dimension": "Offline Resilience in Rural / Remote Environments",
                "description": "Agricultural scouting often takes place in remote rural areas with zero cellular reception.",
                "mitigation_strategy": (
                    "Deploy an offline-first PWA caching model weights via ONNX Runtime Web on smartphone devices, "
                    "queuing survey records locally in IndexedDB until cellular connectivity resumes."
                ),
            },
            {
                "dimension": "False Positive Management in Spray Recommendations",
                "description": "Erroneous fungal diagnosis could lead to unnecessary, expensive, and ecologically damaging pesticide applications.",
                "mitigation_strategy": (
                    "Enforce a dual-tier confidence verification threshold; diagnoses with epistemic uncertainty > 0.30 "
                    "require mandatory human agronomist verification prior to triggering chemical prescription orders."
                ),
            },
            {
                "dimension": "Drone Telemetry & Farm Spatial Privacy",
                "description": "Farm boundary and yield data constitute proprietary agricultural business intelligence.",
                "mitigation_strategy": (
                    "Enforce strict tenant isolation in PostgreSQL, encrypt parcel geometries at rest, and implement role-based access control."
                ),
            },
        ]

        deployment_architecture = {
            "deployment_model": "Edge-Cloud Collaborative Agricultural Architecture",
            "minimum_viable_deployment": (
                "Workstation equipped with 1x NVIDIA GPU (16GB VRAM), 32GB RAM, 1TB NVMe SSD for high-resolution ortho-mosaic processing, "
                "running Docker Compose with PostgreSQL 16 (PostGIS) and FastAPI backend."
            ),
            "production_enhancements": (
                "Kubernetes cluster with worker nodes for asynchronous tiled drone image processing, "
                "and quantized INT8 models deployed to edge handheld scout tablets for instantaneous in-field inference."
            ),
            "hosting_components": [
                "FastAPI Analytical Service (Dockerized)",
                "PostgreSQL 16 with PostGIS 3.4 Spatial Database",
                "Asynchronous Image Processing Worker (Celery / Redis)",
                "PWA Mobile Scout Client (TypeScript / React)",
            ],
            "environment_configuration": [
                "BATCH_INFERENCE_WORKERS=4",
                "MAX_ORTHOMOSAIC_SIZE_MB=2048",
                "POSTGRES_DB=agri_pathology_db",
                "ENABLE_OFFLINE_EDGE_SYNC=true",
            ],
            "scaling_considerations": (
                "Drone survey flights generate gigabytes of multi-band imagery during planting and harvest seasons. "
                "Tiling and segmentation should be executed asynchronously via background worker pools with Parquet caching."
            ),
        }

        architecture_justification = [
            {
                "objective_or_gap": "Overcoming ambient lighting, shadow variations, and complex outdoor canopy clutter",
                "architectural_choice": f"Decoupled Canopy Segmentation Gateway with {primary_algo}",
                "justification": (
                    "Direct classification of raw field photos suffers from background soil and weed confusion. "
                    "Isolating foliar blades via semantic canopy segmentation ensures the model learns cellular lesion morphology "
                    "rather than spurious outdoor background correlations."
                ),
                "trade_offs": "Adds an initial segmentation inference pass (~40ms per image).",
                "related_question_ids": q_ids[:1],
                "related_gap_ids": g_ids[:1],
            },
            {
                "objective_or_gap": "Preventing catastrophic crop loss before visible foliar symptoms manifest",
                "architectural_choice": "Coupled Microclimate Spore Dispersal & Outbreak Forecasting Engine",
                "justification": (
                    "By the time visual lesions are rampant across a field, treatment efficacy is severely degraded. "
                    "Fusing early visual lesion detection with microclimatic temperature and humidity curves enables proactive, "
                    "localized preventive action before field-wide spore dispersal occurs."
                ),
                "trade_offs": "Requires deployment or API integration of field microclimate weather telemetry.",
                "related_question_ids": q_ids[1:2] if len(q_ids) > 1 else q_ids,
                "related_gap_ids": g_ids[1:2] if len(g_ids) > 1 else g_ids,
            },
        ]

        alternative_architectures = [
            {
                "title": "Standard Direct CNN Classifier on Raw Uncropped Field Photos",
                "description": "Feed raw smartphone and drone photos straight into a standard ResNet without canopy segmentation.",
                "advantages": ["Simpler training pipeline", "Single-stage inference"],
                "disadvantages": ["Severe overfitting to background soil, weeds, and lighting", "High false positive rate under field conditions"],
                "complexity": "Low",
                "suitable_conditions": "Laboratory bench imaging under strictly controlled artificial lighting.",
                "rejection_reason": "Fails to generalize across varying outdoor field weather conditions and complex multi-plant canopies.",
            },
        ]

        implementation_plan = [
            {
                "stage_number": 1,
                "stage_name": "Agricultural Dataset & Foliar Segmentation Pipeline Setup",
                "tasks": [
                    "Collect and annotate foliar benchmark datasets across targeted plant species and disease classes",
                    "Train semantic canopy segmentation model to isolate leaf blades from background clutter",
                    "Configure PostGIS spatial schema for farm parcel boundaries and georeferenced survey runs",
                ],
                "dependencies": ["Annotated foliar plant disease image datasets"],
                "deliverable": "Working background-removal preprocessing script and parcel database schema",
                "verification_method": "Intersection-over-Union (IoU) > 0.90 on leaf blade segmentation across diverse field lighting",
            },
            {
                "stage_number": 2,
                "stage_name": f"{primary_algo} Pathology Diagnostic Core Training",
                "tasks": [
                    "Fine-tune vision transformer backbone with multi-label classification and lesion severity heads",
                    "Implement spatial attention extraction for visual inspection of lesion hotspots",
                    "Conduct cross-cultivar generalizability benchmark on unseen field datasets",
                ],
                "dependencies": ["Stage 1 segmentation pipeline"],
                "deliverable": "Trained diagnostic model checkpoint with attention heatmap visualizer",
                "verification_method": "Top-1 diagnosis accuracy > 94% with balanced F1-score across all pathogen strains",
            },
            {
                "stage_number": 3,
                "stage_name": "Epidemiological Forecaster & Extension Advisory Integration",
                "tasks": [
                    "Integrate temperature-humidity infection risk curves with vision diagnostic outputs",
                    "Construct progressive web application for handheld smartphone field scouting",
                    "Build GIS heatmap visualizer displaying parcel infestation severity",
                ],
                "dependencies": ["Stage 2 diagnostic model"],
                "deliverable": "Full-stack mobile field scout application and agronomic advisory dashboard",
                "verification_method": "Sub-2 second total roundtrip diagnosis and prescription generation on mobile client",
            },
        ]

        limitations_and_assumptions = [
            {
                "category": "Foliar Occlusion in Dense Canopies",
                "description": "Lower canopy leaves occluded by upper vegetative foliage may evade aerial drone visual detection.",
            },
            {
                "category": "Pathogen Strain Mutation Boundaries",
                "description": "Emergence of novel uncatalogued pathogen variants requires human laboratory pathologist verification.",
            },
        ]

        return {
            "topic": topic,
            "architecture_title": arch_title,
            "architecture_type": arch_type,
            "architecture_summary": arch_summary,
            "components": components,
            "architecture_diagram": diagram,
            "data_flow": data_flow,
            "technology_stack": technology_stack,
            "data_storage_design": data_storage_design,
            "security_and_reliability": security_and_reliability,
            "deployment_architecture": deployment_architecture,
            "architecture_justification": architecture_justification,
            "alternative_architectures": alternative_architectures,
            "implementation_plan": implementation_plan,
            "limitations_and_assumptions": limitations_and_assumptions,
            "missing_upstream_context": missing_context,
        }
