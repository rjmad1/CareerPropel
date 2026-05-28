[**CareerPropel API Reference**](../README.md)

***

[CareerPropel API Reference](../globals.md) / buildProfileKnowledgeGraph

# Function: buildProfileKnowledgeGraph()

> **buildProfileKnowledgeGraph**(`profile`): [`ProfileKnowledgeGraph`](../interfaces/ProfileKnowledgeGraph.md)

Defined in: [src/lib/profile/knowledge-builder.ts:13](https://github.com/rjmad1/CareerPropel/blob/409c625125f0d1b63f66f92160c82ad4b76461b4/src/lib/profile/knowledge-builder.ts#L13)

Knowledge Graph Constructor

Takes candidate profile components (skills, achievements) and builds
a connected semantic graph. Assigns circular layout coordinates (x, y)
for beautiful SVG diagram rendering.

## Parameters

### profile

[`ProfileSummary`](../interfaces/ProfileSummary.md)

## Returns

[`ProfileKnowledgeGraph`](../interfaces/ProfileKnowledgeGraph.md)
