import React from "react";
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { HierarchyPointNode, HierarchyPointLink } from '@visx/hierarchy/lib/types';
import { LinkVertical } from '@visx/shape';
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import {useTooltip} from '@visx/tooltip';
import './css/evaluationTree.css';
import {RATreeNode} from "../ratree/raTreeNode";
import {UnaryNode} from "../ratree/unaryNode";
import {BinaryNode} from "../ratree/binaryNode";
import {getTreeDepth} from "../ratree/raTreeTools";
import {computeFontSizeInPx} from "../utils/fontUtils";

/**
 * Id of the SVG element for evaluation tree rendereing.
 * @public
 */
export const evalTreeSVGId: string = "eval-tree-svg";

/**
 * Props of EvaluationTree component.
 * @public
 */
interface EvaluationTreeProps {
    /**
     * root of the evaluation tree to be displayed
     * @type RATreeNode
     * @public
     */
    tree: RATreeNode,
    /**
     * index of the current selected node (with respect to depth first search)
     * @type number
     * @public
     */
    selected: number,
    /**
     * handler of click on nodes, it receives the index of the clicked node (with respect to depth first search)
     * @type Function
     * @public
     */
    onClick: (index: number) => void,
    /**
     * true if dark theme should be applied
     * @type boolean
     * @public
     */
    darkTheme: boolean
}

/**
 * Component displaying an evaluation tree. The tree is interactive and handles clicking on the nodes.
 * Accepts {@link EvaluationTreeProps} props.
 *
 * @public
 */
export class EvaluationTree extends React.Component<EvaluationTreeProps, {}> {
    render() {
        return (
            <ParentSize>{({ width }) =>
                <TreeComponent
                    raTree={this.props.tree}
                    selected={this.props.selected}
                    width={width}
                    onClick={this.props.onClick}
                    darkTheme={this.props.darkTheme}
                />}
            </ParentSize>
        );
    }
}

// @ts-ignore
const cssConstants: CSSStyleDeclaration = getComputedStyle(document.querySelector(':root'));

const fontSize: string = cssConstants.getPropertyValue('--eval-tree-font-size');
const fontFamily: string = cssConstants.getPropertyValue('--eval-tree-font-family');
const {fontWidth, fontHeight} = computeFontSizeInPx(fontFamily, fontSize);
const nodePaddingX2: number = 24;
const nodeHeight = 2 * fontHeight + nodePaddingX2;
const maxNodeTextLength = 30;

const backgroundColorLight = cssConstants.getPropertyValue('--light-color-a');
const backgroundColorDark = cssConstants.getPropertyValue('--dark-color-a');
const textColorLight = cssConstants.getPropertyValue('--text-color-light');
const textColorDark = cssConstants.getPropertyValue('--text-color-dark');
const selectedNodeColorLight = cssConstants.getPropertyValue('--light-color-c');
const unselectedNodeColorLight = cssConstants.getPropertyValue('--light-color-b');
const selectedNodeColorDark = cssConstants.getPropertyValue('--dark-color-d');
const unselectedNodeColorDark = cssConstants.getPropertyValue('--dark-color-c');

/**
 * Data for evaluation tree nodes.
 */
interface DisplayTreeNode {
    title: string;
    symbol: string,
    index: number;
    children?: this[];
}

/**
 * Creates a DisplayTreeNode tree from the given RATreeNode tree.
 *
 * @param tree RATreeNode tree to parse to DisplayTreeNode tree
 * @return parsed DisplayTreeNode tree
 */
function parseTreeForDisplay(tree: RATreeNode): DisplayTreeNode {
    let indexes = 0;
    function parseTreeForDisplayHelper(node: RATreeNode): DisplayTreeNode {
        let symbol: string = node.getOperationSymbol();
        if (symbol.length > maxNodeTextLength) {
            symbol = symbol.slice(0, maxNodeTextLength - 4) + "..." + symbol.charAt(symbol.length - 1);
        }

        if (node instanceof UnaryNode) {
            return {
                title: node.getOperationName(),
                symbol: symbol,
                index: indexes++,
                children: [
                    parseTreeForDisplayHelper(node.getSubtree())
                ]
            }
        }
        else if (node instanceof BinaryNode) {
            return {
                title: node.getOperationName(),
                symbol: symbol,
                index: indexes++,
                children: [
                    parseTreeForDisplayHelper(node.getLeftSubtree()),
                    parseTreeForDisplayHelper(node.getRightSubtree())
                ]
            }
        }
        else /* (tree instanceof RelationNode) */ {
            return {
                title: node.getOperationName(),
                symbol: symbol,
                index: indexes++
            };
        }
    }
    return parseTreeForDisplayHelper(tree);
}

/**
 * Component representing individual nodes of the displayed tree.
 *
 * Props:
 * - node: HierarchyPointNode<DisplayTreeNode>: node to be displayed wrapped as visx HierarchyPointNode.
 * - selected: boolean: boolean whether the given node is currently selected by the user
 * - onClick: (index: number) => void: handler of click on the node, it receives the index of the node (with
 * respect to depth first search)
 */
function TreeNodeComponent({ node, selected, onClick, darkTheme }:
                               { node: HierarchyPointNode<DisplayTreeNode>, selected: boolean, onClick: (index: number) => void, darkTheme: boolean }): JSX.Element {
    const {
        tooltipOpen, // true when mouse is over
        showTooltip,
        hideTooltip
    } = useTooltip();

    const handleMouseOver = () => {
        showTooltip({ tooltipLeft: 0, tooltipTop: 0 });
    };

    // computes node width with respect to the text length and asserts it wider than taller
    let nodeWidth = Math.max(node.data.title.length, node.data.symbol.length) * fontWidth + nodePaddingX2;
    if (nodeWidth < nodeHeight) {
        nodeWidth = nodeHeight;
    }

    return (
        // top=y, left=x for vertical layout; top=x, left=y for horizontal layout
        <Group top={node.y} left={node.x}>
            <rect
                height={nodeHeight} width={nodeWidth}
                y={-nodeHeight / 2} x={-nodeWidth / 2} rx={5}
                fill={darkTheme ?
                    (selected ? selectedNodeColorDark : (tooltipOpen ? selectedNodeColorDark : unselectedNodeColorDark)) :
                    (selected ? selectedNodeColorLight : (tooltipOpen ? selectedNodeColorLight : unselectedNodeColorLight))}
                onClick={() => {
                    onClick(node.data.index);
                }}
                cursor="pointer"
                onMouseOver={handleMouseOver}
                onMouseOut={hideTooltip}
            />
            <text
                y="-4px"
                dy=".2em"
                fontSize={fontSize}
                fontFamily={fontFamily}
                textAnchor="middle"
                style={{ pointerEvents: "none"}}
                fill={darkTheme ? textColorDark : textColorLight}
            >
                {node.data.symbol === "" ?
                    <tspan x="0" dy=".5em">{node.data.title}</tspan> :
                    (<>
                        <tspan x="0" dy="0">{node.data.title}</tspan>
                        <tspan x="0" dy="1.2em">{node.data.symbol}</tspan>
                    </>)}
            </text>
        </Group>
    );
}

/**
 * Internal component for displaying the evaluation tree. It uses visx Tree component.
 *
 * Props:
 * - tree: RATreeNode: root of the evaluation tree to be displayed
 * - selected: number: index of the current selected node (with respect to depth first search)
 * - width: number: width of the parent container
 * - onClick: (index: number) => void: handler of click on nodes, it receives the index of the clicked node (with
 * respect to depth first search)
 */
function TreeComponent({raTree, selected, width, onClick, darkTheme}:
                           {raTree: RATreeNode, selected: number, width: number, onClick: (index: number) => void, darkTheme: boolean}): JSX.Element | null {
    const treeDepth: number = getTreeDepth(raTree);
    // height = "nodes height" + "gaps between nodes" + "margin up and under"
    const height = (treeDepth + 1) * nodeHeight + treeDepth * nodeHeight / 2 + nodeHeight;
    const margin = { top: nodeHeight, left: 0 / 2, right: 0 / 2, bottom: nodeHeight };
    const yMax = height - margin.top - margin.bottom;
    const xMax = width - margin.left - margin.right;

    const tree: DisplayTreeNode = parseTreeForDisplay(raTree);
    const data = hierarchy<DisplayTreeNode>(tree);

    return width < 10 ? null : (
        <svg id="eval-tree-svg" width={width} height={height}>
            <rect width={width} height={height} rx={14} fill={darkTheme ? backgroundColorDark : backgroundColorLight} />
            <Tree<DisplayTreeNode> root={data} size={[xMax, yMax]}>
                {tree => (
                    <Group top={margin.top} left={margin.left}>
                        {tree.links().map((link, i) => (
                            <LinkVertical<HierarchyPointLink<DisplayTreeNode>, HierarchyPointNode<DisplayTreeNode>>
                                key={`cluster-link-${i}`}
                                data={link}
                                stroke={darkTheme ? textColorDark : textColorLight}
                                strokeWidth="1"
                                strokeOpacity={1}
                                fill="none"
                            />
                        ))}
                        {tree.descendants().map((node) => (
                            <TreeNodeComponent
                                key={`node-${node.data.index}`}
                                node={node}
                                selected={node.data.index === selected}
                                onClick={onClick}
                                darkTheme={darkTheme}
                            />
                        ))}
                    </Group>
                )}
            </Tree>
        </svg>
    );
}