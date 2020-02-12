package com.alibaba.nacos.console.controller;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.nacos.api.common.Constants;
import com.alibaba.nacos.api.exception.NacosException;
import com.alibaba.nacos.api.naming.utils.NamingUtils;
import com.alibaba.nacos.console.model.GraphEdge;
import com.alibaba.nacos.console.model.GraphGroup;
import com.alibaba.nacos.console.model.GraphNode;
import com.alibaba.nacos.naming.core.Cluster;
import com.alibaba.nacos.naming.core.Instance;
import com.alibaba.nacos.naming.core.Service;
import com.alibaba.nacos.naming.core.ServiceManager;
import com.alibaba.nacos.naming.pojo.ServiceView;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController("consoleGraph")
@RequestMapping("/v1/console/graph")
public class GraphController {
    private static final Logger logger = LoggerFactory.getLogger(GraphController.class);

    @Autowired
    protected ServiceManager serviceManager;

    private List<GraphNode> graphNodes;
    private List<GraphEdge> graphEdges;
    private List<GraphGroup> graphGroups;

    @RequestMapping(value = "/instances")
    public JSONObject instanceList(@RequestParam(defaultValue = Constants.DEFAULT_NAMESPACE_ID) String namespaceId,
                                   @RequestParam(defaultValue = Constants.DEFAULT_GROUP) String groupName,
                                   @RequestParam String serviceName) throws NacosException {
        JSONObject result = new JSONObject();
        String groupedServiceName = serviceName;
        if (StringUtils.isNotBlank(serviceName) && !serviceName.contains(Constants.SERVICE_INFO_SPLITER)) {
            groupedServiceName = groupName + Constants.SERVICE_INFO_SPLITER + serviceName;
        }
        graphNodes = new ArrayList<>();
        graphEdges = new ArrayList<>();
        graphGroups = new ArrayList<>();

        getList(namespaceId, groupedServiceName, null);

        JSONObject dataView = new JSONObject();
        if (graphNodes != null && !graphNodes.isEmpty()) {
            dataView.put("nodes", graphNodes);
        }
        if (graphEdges != null && !graphEdges.isEmpty()) {
            dataView.put("edges", graphEdges);
        }
        if (graphGroups != null && !graphGroups.isEmpty()) {
            dataView.put("groups", graphGroups);
        }

        result.put("data", dataView);
        return result;
    }

    private void getList(String namespaceId, String serviceName, String sourceId) {
        if (StringUtils.isNotBlank(serviceName) && !serviceName.contains(Constants.SERVICE_INFO_SPLITER)) {
            serviceName = Constants.DEFAULT_GROUP + Constants.SERVICE_INFO_SPLITER + serviceName;
        }

        Service service = serviceManager.getService(namespaceId, serviceName);
        if (service != null) {
            String name = NamingUtils.getServiceName(serviceName);
            ServiceView serviceView = new ServiceView();
            serviceView.setName(name);
            serviceView.setGroupName(NamingUtils.getGroupName(service.getName()));
            serviceView.setClusterCount(service.getClusterMap().size());
            serviceView.setIpCount(service.allIPs().size());
            serviceView.setHealthyInstanceCount(service.healthyInstanceCount());
            serviceView.setTriggerFlag(service.triggerFlag() ? "true" : "false");

            GraphNode serviceGraphNode = new GraphNode();
            serviceGraphNode.setId(serviceName);
            serviceGraphNode.setLabel(name);
            serviceGraphNode.setService(serviceView);
            saveGraphNode(serviceGraphNode);

            if (StringUtils.isNoneBlank(sourceId)) {
                String edgeId = sourceId + Constants.NAMING_INSTANCE_ID_SPLITTER + serviceName;

                GraphEdge serviceGraphEdge = new GraphEdge();
                serviceGraphEdge.setSource(sourceId);
                serviceGraphEdge.setTarget(serviceName);
                serviceGraphEdge.setId(edgeId);
                saveGraphEdge(serviceGraphEdge);
            }

            boolean isGroup = service.getClusterMap().size() > 1;
            String clusterId = "";
            if (isGroup) {
                for (Cluster cluster : service.getClusterMap().values()) {
                    clusterId = cluster.getName() + Constants.NAMING_INSTANCE_ID_SPLITTER + serviceName;
                    GraphGroup graphGroup = new GraphGroup();
                    graphGroup.setId(clusterId);
                    saveGraphGroup(graphGroup);
                }
            }

            List<Instance> instances = service.allIPs();

            for (Instance instance : instances) {
                String instanceName = instance.getIp() + ":" + instance.getPort();
                GraphNode graphNode = new GraphNode();
                graphNode.setId(instance.getInstanceId());
                graphNode.setInstance(instance);
                graphNode.setLabel(instanceName);
                if (isGroup && StringUtils.isNoneBlank(clusterId)) {
                    graphNode.setGroupId(clusterId);
                }
                saveGraphNode(graphNode);

                GraphEdge graphEdge = new GraphEdge();
                String edgeId = serviceName + Constants.NAMING_INSTANCE_ID_SPLITTER + instanceName;
                graphEdge.setId(edgeId);
                graphEdge.setSource(serviceName);
                graphEdge.setTarget(instance.getInstanceId());
                if (instance.isHealthy()) {
                    if (StringUtils.isNoneBlank(sourceId)) {
                        graphEdge.setLabel("weight:"+instance.getWeight());
                    }
                } else {
                    graphEdge.setLabel("X");
                }
                saveGraphEdge(graphEdge);

                Map<String, String> metaData = instance.getMetadata();
                if (metaData != null && !metaData.isEmpty()) {
                    String key = com.alibaba.nacos.console.common.Constants.PROVIDERS_KEY;
                    if (metaData.containsKey(key)) {
                        try {
                            JSONArray metaArray = (JSONArray) JSON.parse(metaData.get(key));
                            for (int i = 0; i < metaArray.size(); i++) {
                                JSONObject metaObject = metaArray.getJSONObject(i);
                                String metaServiceName = metaObject.getString("name");
                                if (!name.equals(metaServiceName)) {
                                    getList(namespaceId, metaServiceName, instance.getInstanceId());
                                }
                            }
                        } catch (Exception ex) {

                        }
                    }
                }

            }
        }
    }

    private void saveGraphNode(GraphNode node){
        if(graphNodes==null){
            graphNodes = new ArrayList<>();
        }
        if(!graphNodes.equals(node)){
            graphNodes.add(node);
        }
    }
    private void saveGraphEdge(GraphEdge edge){
        if(graphEdges==null){
            graphEdges = new ArrayList<>();
        }
        if(!graphEdges.equals(edge)){
            graphEdges.add(edge);
        }
    }
    private void saveGraphGroup(GraphGroup group){
        if(graphGroups==null){
            graphGroups = new ArrayList<>();
        }
        if(!graphGroups.equals(group)){
            graphGroups.add(group);
        }
    }
}
